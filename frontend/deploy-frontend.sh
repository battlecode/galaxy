
# TODO npm build, npm buildnogame should be reorganized. Now that the game is disentangled from the rest of frontend

BUCKET_NAME="bc-frontend"



# TODO check git status
# (on master, up-to-date)

# Clean and make build contents
rm -r build
npm install
npm run build

# Handle bucket:
# Clean
gsutil -m rm gs://$BUCKET_NAME/**
# Upload
cd build
gsutil -m cp -r * gs://$BUCKET_NAME
cd ..
# Enforce cache policy
gsutil -m setmeta -h "Cache-Control:no-cache" gs://$BUCKET_NAME/**
# Set home-page; see readme for info
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME


