# Immediately exit this script if any command fails, to safeguard against being in a broken state.
# Note that this doesn't catch _everything_ but it helps.
# Also note that set -e sometimes doesn't behave how you may expect.
# http://mywiki.wooledge.org/BashFAQ/105
# However, this script is simple enough that we are okay, for now.
set -e

BUCKET_NAME="mitbattlecode-production-frontend"

# Long-term TODO: advanced users should be able to run this script locally.
# Have a user-note to manually check some things (on main, up-to-date; in the right working directory; has npm)
# and then a user prompt, that prevents execution unless the user manually confirms.
# The automation argument should skip that user prompt

if ! [ "$1" = "--this-is-being-run-from-gcloud" ]
then
echo "You should run this from gcloud."
exit 1
fi

# TODO assuming the filelocation from which GCP cloud build runs is different, would need to cd to frontend dir
# `pwd` would help identify this location

# TODO install npm via apt-get
# (assuming a base image of gcloud, so we have gsutil access and authentication)

npm install
# TODO inject build timestamp in here.
# Easiest is to compute timestamp , build_ts = date +(idk i forget the args but)
# REACT_APP_BUILD_TS=$buildts npm run build
# TODO frontend footer should display timestamp too if existing as an env
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
