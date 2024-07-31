import os

def count_files(directory):
    total_files = 0
    for root, dirs, files in os.walk(directory):
        total_files += len(files)
    return total_files
host = 'allwomenstalk.com'
directory_path = "../_site/" + host
print(f'Host: {host}')
print(f"Total number of files: {count_files(directory_path)}")
