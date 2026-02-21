const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const dataApiUrl = Deno.env.get("DATA_API_URL") || "https://data-api.azo.workers.dev";
const dataApiKey = Deno.env.get("DATA_API_KEY") || "";
const dataApiSecret = Deno.env.get("DATA_API_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

async function callDatapi(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${dataApiUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(dataApiKey ? { "X-API-Key": dataApiKey } : {}),
      ...(dataApiSecret ? { "X-API-Secret": dataApiSecret } : {}),
    },
    body: JSON.stringify({
      cluster: "cluster1",
      ...body,
    }),
  });

  let payload: Record<string, unknown> = {};
  try {
    payload = (await res.json()) as Record<string, unknown>;
  } catch (_error) {
    payload = {};
  }

  // DATAPI returns 404 for empty aggregate results on some deployments.
  if (res.status === 404 && path === "/aggregate") {
    return { result: [] };
  }

  if (!res.ok || payload?.success === false) {
    const message = payload?.error || `Upstream request failed (${res.status})`;
    throw new Error(message);
  }
  return payload;
}

function buildCommentProjection() {
  return {
    _id: 1,
    post: 1,
    postid: 1,
    post_id: 1,
    user_id: 1,
    comment_author: 1,
    comment_author_email: 1,
    comment_content: 1,
    comment_parent: 1,
    comment_date: 1,
    comment_approved: 1,
  };
}

async function getAuthenticatedUserId(req: Request) {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) return null;

  const token = authHeader.slice(7).trim();
  if (!token) return null;
  if (supabaseAnonKey && token === supabaseAnonKey) return null;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: supabaseAnonKey,
      },
    });
    if (!response.ok) return null;
    const user = await response.json() as { id?: unknown };
    return typeof user?.id === "string" && user.id.length > 0 ? user.id : null;
  } catch (_error) {
    return null;
  }
}

function isObjectIdString(value: string) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

async function fetchCommentsForPost(postid: string, limit: number) {
  try {
    // Preferred query: supports ObjectId-backed `post` and string-backed post id fields.
    const response = await callDatapi("/aggregate", {
      database: "aws",
      collection: "comments",
      pipeline: [
        {
          $match: {
            $expr: {
              $or: [
                { $eq: [{ $toString: "$post" }, postid] },
                { $eq: ["$postid", postid] },
                { $eq: ["$post_id", postid] },
              ],
            },
          },
        },
        { $sort: { comment_date: -1 } },
        { $limit: limit },
        { $project: buildCommentProjection() },
      ],
    });

    return Array.isArray(response?.result) ? response.result : [];
  } catch (_error) {
    // Compatibility fallback for DATAPI instances that reject `$expr`/`$toString`.
    const baseOrFilter: Array<Record<string, unknown>> = [
      { postid },
      { post_id: postid },
      { post: postid },
    ];

    const fallbackResponse = await callDatapi("/aggregate", {
      database: "aws",
      collection: "comments",
      pipeline: [
        { $match: { $or: baseOrFilter } },
        { $sort: { comment_date: -1 } },
        { $limit: limit },
        { $project: buildCommentProjection() },
      ],
    });

    let rows = Array.isArray(fallbackResponse?.result) ? fallbackResponse.result : [];

    // Optional second-pass match for ObjectId-backed `post` on DATAPI variants that support $oid.
    if (rows.length === 0 && isObjectIdString(postid)) {
      try {
        const objectIdResponse = await callDatapi("/aggregate", {
          database: "aws",
          collection: "comments",
          pipeline: [
            { $match: { post: { $oid: postid } } },
            { $sort: { comment_date: -1 } },
            { $limit: limit },
            { $project: buildCommentProjection() },
          ],
        });
        rows = Array.isArray(objectIdResponse?.result) ? objectIdResponse.result : [];
      } catch (_objectIdError) {
        // Keep non-ObjectId fallback results if $oid is unsupported.
      }
    }

    return rows;
  }
}

function normalizeCommentPayload(payload: Record<string, unknown>) {
  const postid = String(payload.postid || "").trim();
  const comment_author = String(payload.comment_author || "").trim();
  const comment_content = String(payload.comment_content || "").trim();
  const comment_author_email = String(payload.comment_author_email || "").trim();

  if (!postid) return { error: "postid is required" };
  if (comment_author.length < 5) return { error: "Name must be at least 5 characters long" };
  if (comment_content.length < 3) return { error: "Comment too short" };

  return {
    postid,
    comment: {
      blog: "aws",
      post: postid,
      object_type: "post",
      comment_author,
      comment_author_email: comment_author_email || null,
      comment_content,
      comment_parent: false,
      comment_approved: 0,
      toxicity: 0,
      comment_date: new Date().toISOString(),
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const postid = (url.searchParams.get("postid") || "").trim();
      const all = url.searchParams.get("all") === "true";
      const limit = all ? 1000 : 100;

      if (!postid) {
        return jsonResponse({ error: "postid is required" }, 400);
      }

      let rows: Record<string, unknown>[] = [];
      try {
        rows = await fetchCommentsForPost(postid, limit);
      } catch (_error) {
        return jsonResponse({ error: "Failed to load comments" }, 500);
      }
      const comments = rows.map((row: Record<string, unknown>) => ({
        ...row,
        postid: row.postid || row.post_id || row.post || postid,
      }));
      return jsonResponse(comments);
    }

    if (req.method === "POST") {
      const payload = (await req.json()) as Record<string, unknown>;
      const normalized = normalizeCommentPayload(payload);

      if ("error" in normalized) {
        return jsonResponse({ error: normalized.error }, 400);
      }

      const headersAsArrays: Record<string, string[]> = {};
      req.headers.forEach((value, key) => {
        headersAsArrays[key] = [value];
      });
      const authenticatedUserId = await getAuthenticatedUserId(req);

      const document = {
        ...normalized.comment,
        ...(authenticatedUserId ? { user_id: authenticatedUserId } : {}),
        headers: headersAsArrays,
      };

      let response: Record<string, unknown> = {};
      try {
        response = await callDatapi("/insertOne", {
          database: "aws",
          collection: "comments",
          document,
        });
      } catch (_error) {
        return jsonResponse({ error: "Failed to submit comment" }, 500);
      }

      return jsonResponse(
        {
          _id: response?.insertedId || response?.result?.insertedId,
          post: normalized.comment.post,
          postid: normalized.comment.post,
          user_id: authenticatedUserId,
          comment_author: normalized.comment.comment_author,
          comment_author_email: normalized.comment.comment_author_email,
          comment_content: normalized.comment.comment_content,
          comment_parent: normalized.comment.comment_parent,
          comment_date: normalized.comment.comment_date,
          comment_approved: normalized.comment.comment_approved,
        },
        201,
      );
    }

    return jsonResponse({ error: "Method not allowed" }, 405);
  } catch (_error) {
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
});
