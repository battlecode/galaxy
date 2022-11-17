import os

import google.auth

match os.getenv("SIARNAQ_MODE", None):
    case "PRODUCTION":
        credentials, project_id = google.auth.default()
        location = "us-east1"
        enable_actions = True

        admin_email = credentials.service_account_email
        admin_username = "galaxy-admin"

        public_bucket = "mitbattlecode-production-public"
        secure_bucket = "mitbattlecode-production-secure"

        saturn_compile_topic = "production-siarnaq-compile"
        saturn_execute_topic = "production-siarnaq-execute"
        saturn_compile_order = "compile_order"
        saturn_execute_order = "execute_order"

    case "STAGING":
        credentials, project_id = google.auth.default()
        location = "us-east1"
        enable_actions = True

        admin_email = credentials.service_account_email
        admin_username = "galaxy-admin"

        public_bucket = "mitbattlecode-staging-public"
        secure_bucket = "mitbattlecode-staging-secure"

        saturn_compile_topic = "staging-siarnaq-compile"
        saturn_execute_topic = "staging-siarnaq-execute"
        saturn_compile_order = "compile_order"
        saturn_execute_order = "execute_order"

    case _:
        credentials, project_id = None, "null-project"
        location = "nowhere"
        enable_actions = False

        admin_email = "admin@example.com"
        admin_username = "galaxy-admin"

        public_bucket = "nowhere-public"
        secure_bucket = "nowhere-secure"

        saturn_compile_topic = "nowhere-siarnaq-compile"
        saturn_execute_topic = "nowhere-siarnaq-execute"
        saturn_compile_order = "compile_order"
        saturn_execute_order = "execute_order"
