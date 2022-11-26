# Immediately exit this script if any command fails, to safeguard against being in a broken state.
# Note that this doesn't catch _everything_ but it helps.
# Also note that set -e sometimes doesn't behave how you may expect.
# http://mywiki.wooledge.org/BashFAQ/105
# However, this script is simple enough that we are okay, for now.
set -e

BUCKET_NAME="mitbattlecode-production-frontend"

# Warning: You should never run this script locally, because this would involve lots of inconsistencies and cautions.
# Do so at your own risk. Adapt this script to run locally at your own risk.

if ! [ "$1" = "--this-is-being-run-from-gcloud" ]
then
echo "You should run this from gcloud."
exit 1
fi

# TODO assuming the filelocation from which GCP cloud build runs is different, would need to cd to frontend dir
# `pwd` would help identify this location
pwd
apt-get -y install npm

npm install

build_ts=$(date +%s)
REACT_APP_BUILD_TS=$build_ts npm run build

# Handle bucket:

# TODO I'm not sure if whatever agent that runs the gsutil commands will have permissions;
# we should check this

cd build
gsutil -m rsync -r * gs://$BUCKET_NAME

# Enforce cache policy
gsutil -m setmeta -h "Cache-Control:no-cache" gs://$BUCKET_NAME/**
# Set home-page; see readme for info
gsutil web set -m index.html -e index.html gs://$BUCKET_NAME
