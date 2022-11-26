# TODO change bucket_name. or perhaps include the subfolder too
BUCKET_NAME="bc-frontend"


# TODO if run manually, with no extra args, then the script should fail.
# However, include a convoluted second argument (eg --this-is-being-run-from-gcloud) that skips that check ^,
# and that the GCP deploys use when running. Don't explicitly discuss this flag anywhere else (so that users don't rely on it too much)

# Long-term TODO: advanced users should be able to run this script locally.
# Have a user-note to manually check some things (on main, up-to-date; in the right working directory; has npm)
# and then a user prompt, that prevents execution unless the user manually confirms.
# The automation argument should skip that user prompt

# Clean and make build contents
rm -r build # TODO ought to skip this for GCP cloud build

# TODO assuming the filelocation from which GCP cloud build runs is different, would need to cd to frontend dir
# `pwd` would help identify this location

# TODO install npm via apt-get
# (assuming a base image of gcloud, so we have gsutil access and authentication)

npm install
npm run build

# Handle bucket:

# TODO use rsync, instead of rm/cp, in case rm works but cp fails and we're left emptyhanded.
# Consider rsync -d, which should be ok?

# TODO I'm not sure if whatever agent that runs the gsutil commands will have permissions;
# we should check this

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
