import Boom from '@hapi/boom'

export const loginController = {
  handler(_request, h) {
    return h.view('auth/login', {
      pageTitle: 'Auth',
      heading: 'Auth'
    })
  }
}

export const callbackController = {
  async handler(request, h) {
    if(!(request.query.code && request.query.session_state)) {
      throw Boom.badRequest('No auth code');
    }

    console.log(`Auth Code: ${request.query.code}`)

    const code = request.query.code
    const state = request.query.session_state

    // exchange the auth code for an auth token
    const token = await fetch("https://login.microsoftonline.com/common/oauth2/token", {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
        state: state,
        client_id: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ilh0LW83aERicHVwQXotWlBtNkh4Q0ZXUzNjSSIsImtpZCI6Ilh0LW83aERicHVwQXotWlBtNkh4Q0ZXUzNjSSJ9.eyJhdWQiOiJodHRwczovL29yZzk5NzkxYTIxLmNybTExLmR5bmFtaWNzLmNvbS8iLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC82ZjUwNDExMy02YjY0LTQzZjItYWRlOS0yNDJlMDU3ODAwMDcvIiwiaWF0IjoxNzc4MDc3MjcyLCJuYmYiOjE3NzgwNzcyNzIsImV4cCI6MTc3ODA4MTczNywiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsidXJuOnVzZXI6cmVnaXN0ZXJzZWN1cml0eWluZm8iXSwiYWlvIjoiQVVRQXUvOGNBQUFBOE5OUzhBdWswNEZkd3dDK0gzVVQ5bVYwUExxZHdPQ201WGtldjRTMnN1dWVFK2NkWUZObHR0QnA0QVJqOG9SZC9SOWp2U2RYdnUzUElOalVUL0xxdUE9PSIsImFtciI6WyJwd2QiXSwiYXBwaWQiOiI1YjA1YjExNS1mZGQwLTQ2NmUtYTQ0YS1iMTIyZTIxMDA1N2YiLCJhcHBpZGFjciI6IjAiLCJmYW1pbHlfbmFtZSI6Ik1hY2tpbnRvc2giLCJnaXZlbl9uYW1lIjoiT2xpdmlhIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTM3LjIyMC4xMTguMTQwIiwibG9naW5faGludCI6Ik8uQ2lRelpEVTFOMlJrTXkxbU56ZGlMVFF6WlRjdFlUTTFNeTAyWlRrek9ERXdOVGs1T1RjU0pEWm1OVEEwTVRFekxUWmlOalF0TkRObU1pMWhaR1U1TFRJME1tVXdOVGM0TURBd054b3FUMnhwZG1saExrMWhZMnRwYm5SdmMyaEFaR1ZtY21Ga1pYWXViMjV0YVdOeWIzTnZablF1WTI5dElMb0IiLCJuYW1lIjoiT2xpdmlhIE1hY2tpbnRvc2ggIChFcXVhbCBFeHBlcnRzKSIsIm9pZCI6IjNkNTU3ZGQzLWY3N2ItNDNlNy1hMzUzLTZlOTM4MTA1OTk5NyIsInB1aWQiOiIxMDAzMjAwNUQ5Qzc4MDg4IiwicmgiOiIxLkFUb0FFMEZRYjJScjhrT3Q2U1F1QlhnQUJ3Y0FBQUFBQUFBQXdBQUFBQUFBQUFBQUFGQTZBQS4iLCJzY3AiOiJ1c2VyX2ltcGVyc29uYXRpb24iLCJzaWQiOiIwMDQxN2RiYS05NzNlLThiMzMtNTQ3Ni03YjdiZTNhNjJkMGUiLCJzdWIiOiJESE9OUm00X3hIX1BldmtOUkJhZmZmWWY1SXNoZFFaZ05kWjJFQVdZcXlNIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkVVIiwidGlkIjoiNmY1MDQxMTMtNmI2NC00M2YyLWFkZTktMjQyZTA1NzgwMDA3IiwidW5pcXVlX25hbWUiOiJPbGl2aWEuTWFja2ludG9zaEBkZWZyYWRldi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJPbGl2aWEuTWFja2ludG9zaEBkZWZyYWRldi5vbm1pY3Jvc29mdC5jb20iLCJ1dGkiOiJlc1FkRUZEcnZFS3N4U0VkRjVsMEFBIiwidmVyIjoiMS4wIiwieG1zX2FjdF9mY3QiOiIzIDkiLCJ4bXNfZnRkIjoiank3WEFCVkRtdXVwV2dNZlhQcXF3d2dyN2txXzQ4enUwYWtQajVpMWxOOEJjM2RsWkdWdVl5MWtjMjF6IiwieG1zX2lkcmVsIjoiMSAxOCIsInhtc19zdWJfZmN0IjoiMyAxNCJ9.YYkpqcM0O5CqQ0ZdgIVhjJv3Dg_th8jwPJ7XCO0CxEOf3DjXG7kqXoZ7NB_4ZZyh8cmnTL5vSGbU1iKX9l5DAapWA7yOKG3LPKdZ8dBhzb3CDkTq6NcZJqvI_yiPKwXBPNUHjXoEF6L9H3wRUoHPDdaQQLKfVOaSa_V8bZ8FD_m0QvZri6SmgEG-1AbxwnfIpVybc09TsrSvm5SUTBauUmosMa1UCuG7hpIRHFxEJhviNQbHxYsV7i_KpvwhrEsiqinFPiHk2ySCaCuQ2Xptl-uK-PDURNF1qS5R5i9FV-fMuS8BnPTeBGPvZCFkAA7QXf3vVGkdn1XakKwLsLEsWg",
        grant_type: "authorization_code",
        redirect_uri: "http://localhost"
      })
    });

    request.log(`Auth Token: ${JSON.stringify(token)}`)

    if(!token.ok) {
      throw Boom.badRequest("Didn't get a token back...")
    }

    return h.redirect("/")
  }
}
