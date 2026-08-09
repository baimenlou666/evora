# Remaining source resources

The homepage is complete and its first-party files are already local.

The source site's About Me music-player stylesheet references these paths, but
the source server currently returns HTTP 404 for all four:

- `/icons/skip_previous.png`
- `/icons/play.png`
- `/icons/pause.png`
- `/icons/skip_next.png`

About Me also contains many externally hosted quiz-result images. They remain
linked to their original hosts, exactly as in the source HTML. Downloading them
locally is optional and may not be possible where the original host is already
offline or blocks hotlinking.

Resources still required for subsequent full-site passes are the first-party
images embedded in individual blog articles and the Experiments pages. These
are not required by the completed homepage, About Me page, or Posts index.

