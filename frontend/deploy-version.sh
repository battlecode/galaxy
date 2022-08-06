# TODO make ver num an arg. Also sanity check for 2022 prefix
# TODO move 2022 in gsutil  to a var name

# TODO this script should really belong in engine repo

BUCKET_NAME="bc-game-storage"
mkdir tmp
echo '2022.0.1.1' > tmp/version.txt

gsutil -m rm gs://$BUCKET_NAME/versions/2022/**
gsutil -m cp tmp/version.txt gs://$BUCKET_NAME/versions/2022/
gsutil setmeta -h "Cache-Control:no-cache" -r gs://$BUCKET_NAME/versions/2022/**
# make this public
gsutil acl ch -u AllUsers:R -r gs://$BUCKET_NAME/versions/2022/**

rm -r tmp
