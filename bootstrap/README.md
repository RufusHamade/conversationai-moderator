# bootstrap-moderator

Moderator is only useful if you have data. This directory contains sample comments
and a Python script that uses the Moderator API to add that data to an instance
of Moderator.

To use the Moderator API, you'll need a JWT auth token for a "service" user in
your Moderator app. A "service" user has permission to use the
[publisher API](../docs/osmod_publisher_api.md) to read and write articles and
comments to the Moderator database.

To generate a JWT token for a service user:

* Create a service user:

```bash
bin/osmod users:create --group service --name "Robot"
```

This produces the following output:

```
info: User successfully created
info:  id=17, group=service, name=Robot, email=undefined, [snip]
```

Remember this user's ID (`17` in this case).

* Get the JSON web token for that user:

```bash
bin/osmod users:get-token --id={ID_REMEMBERED_FROM_PREVIOUS_STEP}
```

Next, you need to set the `MODERATOR_AUTH` environment variable using the JWT
you just generated. You also need to set the `MODERATOR_API`.

```shell
# The JWT authentication token generated for a Moderator service user
export MODERATOR_AUTH="JWT {a-valid-jwt-for-a-service-user}"

# The URL of the Moderator API.  If running locally as described in the
# root README, use:
export MODERATOR_API=http://127.0.0.1:8080
```

Make sure the Moderator API is running and then run the bootstrap script to load
comments and articles into your Moderator instance.
```
python3 bootstrap_reviews.py
```
