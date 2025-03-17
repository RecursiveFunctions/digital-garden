---
{"dg-publish":true,"permalink":"/linux/ftp/"}
---

 **-v** shows all responses from the FTP server. This can be useful when debugging connectivity issues.

the **-n** option prevents auto-login on the FTP server. If auto-login is enabled, the server will attempt log into the server with the current user, thus preventing us from specifying a different username and password.

The easiest way to access an FTP server is through _anonymous access_. This is when the user is _anonymous_ and a password is not needed. Anything can be entered in as the password, and the login will be accepted.

```bash
ftp localhost
```

When using the _-n_ option, the initial logging in is a bit different, since it won't prompt for the username or password.

```bash
ftp -nv localhost
```

to download a file:
```bash
ftp> get file.txt
```