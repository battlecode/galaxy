echo "Running generate_types.bat"
call conda activate galaxy
echo "navigate to galaxy folder"
cd ..
echo "Generate OpenAPI 3.0 backend schema from siarnaq"
python backend/manage.py spectacular --file schema.yml --validate

:: TODO: delete the types folder before regenerating it.

:: echo "Download openapitools"
:: npm install @openapitools/openapi-generator-cli -g
:: if you have a java error, just install java 8 and reload terminal
echo "Generate typescript types from schema"
npx @openapitools/openapi-generator-cli generate -i schema.yml -o frontend2/src/utils/types -g typescript-fetch --additional-properties=modelPropertyNaming=original --additional-properties=disallowAdditionalPropertiesIfNotPresent=false --additional-properties=stringEnums=true
