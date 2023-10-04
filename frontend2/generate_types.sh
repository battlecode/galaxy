#!/bin/bash

# Can't run the script? You may need to run `chmod +x generate_types.sh` to make this script executable.
# This script should be run from the frontend2 folder.

echo "Running generate_types.sh"

cd ../backend

echo "Generating OpenAPI 3.0 backend schema from siarnaq.."
# `conda run -n galaxy` runs the command inside the conda environment.
conda run -n galaxy python manage.py spectacular --file frontend2/schema.yml --validate

cd ../frontend2

# Delete the types folder before regenerating it.
echo "Deleting the old types folder.."
rm -rf ./src/utils/types

# Generate types folder
echo "Generating typescript types from schema, placing them in frontend2/src/utils/types.."
conda run -n galaxy npx @openapitools/openapi-generator-cli generate -i schema.yml -o ./src/utils/types -g typescript-fetch --additional-properties=modelPropertyNaming=original --additional-properties=disallowAdditionalPropertiesIfNotPresent=false --additional-properties=stringEnums=true
