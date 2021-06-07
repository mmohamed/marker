# Marker for interactive board
Add interactive markers to your boards.

## 1- Deployment
- App a Client in KeyCloak 
Define a simple **Web application** in your [Keycloak](https://github.com/keycloak/keycloak) instance.
Then copy the installation configuration 
```
{
  "realm": "master",
  "auth-server-url": "http://localhost:8080/auth/",
  "ssl-required": "external",
  "resource": "marker",
  "public-client": true
}
```
<img src="docs/keycloak-config.png" width="99%">

- Deploy Marker Application Backend

- Deploy Marker Application Front

## 2- Developement

---- 

[*More information*](https://blog.medinvention.dev)
