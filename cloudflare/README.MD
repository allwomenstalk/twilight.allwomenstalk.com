Keep all pages data in file. 
File is used for deploy these pages.

deploy.js - takes list from hosts.json and deploys each project 

cname.js - to upate cnames on Route53 
routesupdate.js - not sure if it works at all and how (don't use)

buckets.js - delete/clean buckets (too long so py file is better)
buckets.py - cleasn versions and files with boto3
buckets.sh - for buckets delete 

test.js - calls all hosts from hosts.csv and makes screenshots 


# Deployments 

https://api.cloudflare.com/client/v4/accounts/cbe44b125e21f7aada0eefba2df8fc30/pages/projects/4192a493-da37-4340-a545-8027e1800c78/deployments

curl 'https://api.cloudflare.com/client/v4/accounts/cbe44b125e21f7aada0eefba2df8fc30/pages/projects/apps-allwomenstalk-com/deployments' \
--header 'Authorization: Bearer Pixaud0cA3muF1JWAZf3vFUhHTtsMB10mH1Opyij'


# Domains pages udpate 
- create file domainpages.json with pages data to move subdomains 
- run domainupdate.ipynb to update records on Cloudflare and create routes.json 
- run node route53cnames.js to update records on Route53
