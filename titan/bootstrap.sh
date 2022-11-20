#!/bin/sh

set -x -o errexit

# The Docker image has configured clamd to use a socket at /tmp/clamd.sock. However,
# Titan expects it to be at /run/clamav/clamd.sock instead. So update the config.
sed -i 's/\/tmp\/clamd\.sock/\/run\/clamav\/clamd\.sock/' /etc/clamav/clamd.conf

# I solemnly swear that I am up to no good.
# We need to start the clamd daemon, and conveniently the image provides an init script
# to do this. Less conveniently, that init script also ends with a blocking command to
# "wait forever". So, let's drop that command and run everything else...

grep -v 'tail -f "/dev/null"' /init | sh
# Mischief managed. I am a terrible person.

# Run the Titan server process.
exec $APP_HOME/titan "$@"
