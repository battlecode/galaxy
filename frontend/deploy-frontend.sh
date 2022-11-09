# TODO change bucket_name
BUCKET_NAME="bc-frontend"

# TODO have a user-note to manually check some things (on main, up-to-date; in the right working directory; has npm)
# TODO Automation should skip this check. Idea: if run manually, with no extra args,
# then display these checks and force user inputs.
# However, include a second argument (eg --this-is-being-run-from-gcloud) that skips those checks,
# and that the GCP deploys use when running. Don't explicitly discuss this flag anywhere else (so that users don't rely on it too much)

# Clean and make build contents
rm -r build # TODO ought to skip this for GCP cloud build

# TODO assuming the filelocation from which GCP cloud build runs is different, would need to cd to frontend dir
# `pwd` would help identify this location

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
