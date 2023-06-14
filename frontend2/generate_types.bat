echo "Running generate_types.bat"
call conda activate galaxy
echo "navigate to galaxy folder"
cd ..
echo "Generate OpenAPI 3.0 backend schema from siarnaq"
python backend/manage.py spectacular --file schema.yml
echo "Generate typescript types from schema"
npx @openapitools/openapi-generator-cli generate -i schema.yml -o frontend2/utils/types -g typescript-jquery
