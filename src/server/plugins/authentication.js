import Jwt from '@hapi/jwt';
import JwksRsa from 'jwks-rsa';
import { ProxyAgent } from 'proxy-agent';

export const authentication = {
  plugin: {
    name: 'authentication',
    version: '0.1.0',
    register: async (server, options) => {
      await server.register(Jwt);

      const jwksClient = JwksRsa({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://login.microsoftonline.com/common/discovery/v2.0/keys`,
        fetcher: async (jwksUri) => {
          const response = await fetch(jwksUri);
          if (!response.ok) {
            throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
          }
          return await response.json();
        }
      });

      server.auth.strategy('azure-ad-jwt', 'jwt', {
        cookieName: 'econtrol-auth',

        keys: async ({ token, decoded }) => {
          const header = decoded.header;
          if (!header || !header.kid) {
            throw new Error('Missing key ID (kid) in token header');
          }
          console.log("Decoded:" + JSON.stringify(decoded))
          console.log(`Getting signing key for kid: ${header.kid}`)
          const key = await jwksClient.getSigningKey(header.kid);
          return { key: key.getPublicKey(), algorithms: ['RS256'] };
        },
        verify: {
          aud: "https://org99791a21.crm11.dynamics.com/",
          iss: [
            "https://login.microsoftonline.com/{tenantId}/v2.0",
            "https://sts.windows.net/6f504113-6b64-43f2-ade9-242e05780007/"
          ],
          sub: false,
          nbf: true,
          exp: true
        },
        validate: (artifacts, request) => {
          console.log("validated")
          return {
            isValid: true,
            credentials: {
              decoded: artifacts.decoded.payload,
              token: artifacts.token
            }
          };
        }
      });
      server.auth.default('azure-ad-jwt');

      server.ext('onPreResponse', (request, h) => {
        const response = request.response;

        if (response.isBoom) {
          const statusCode = response.output.statusCode;

          if (statusCode === 401) {
            return h.redirect('/auth/login')
              .unstate('econtrol-auth')
              .takeover();
          }
        }

        return h.continue;
      });
    }
  }
};
