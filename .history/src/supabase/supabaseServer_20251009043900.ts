Auth error: Error [AuthSessionMissingError]: Auth session missing!
    at <unknown> (../../src/GoTrueClient.ts:1631:49)
    at SupabaseAuthClient._useSession (../../src/GoTrueClient.ts:1473:20)
    at async SupabaseAuthClient._getUser (../../src/GoTrueClient.ts:1623:14)
    at async (../../src/GoTrueClient.ts:1607:14)
    at async (../../src/GoTrueClient.ts:1381:18) {
  __isAuthError: true,
  status: 400,
  code: undefined
}
 GET /?error=invalid_request&error_code=bad_oauth_state&error_description=OAuth+callback+with+invalid+state 307 in 428ms
 ✓ Compiled /auth in 47ms
 GET /auth 200 in 633ms
 GET /favicon.ico?favicon.0b3bf435.ico 200 in 333ms
 GET /auth 200 in 230ms
 GET /favicon.ico?favicon.0b3bf435.ico 200 in 333ms
User logged in: 78815e77-6139-4b41-9f67-1e0de9a66ad2
 GET /auth/callback?code=de8ccdeb-be10-44bb-ac95-ffbe44e7b41d 307 in 952ms
 GET / 307 in 2343ms
 GET /create-workspace 200 in 219ms
 GET /api/uploadthing 200 in 1002ms
 GET /api/uploadthing 200 in 319ms
Error [AuthApiError]: Invalid Refresh Token: Already Used
    at handleError (../../../src/lib/fetch.ts:102:9)
    at async _handleRequest (../../../src/lib/fetch.ts:195:5)
    at async _request (../../../src/lib/fetch.ts:157:16)
    at async (../../src/GoTrueClient.ts:2268:18)
    at async (../../../src/lib/helpers.ts:228:26) {
  __isAuthError: true,
  status: 400,
  code: 'refresh_token_already_used'
}
Error [AuthApiError]: Invalid Refresh Token: Already Used
    at handleError (../../../src/lib/fetch.ts:102:9)
    at async _handleRequest (../../../src/lib/fetch.ts:195:5)
    at async _request (../../../src/lib/fetch.ts:157:16)
    at async (../../src/GoTrueClient.ts:2268:18)
    at async (../../../src/lib/helpers.ts:228:26) {
  __isAuthError: true,
  status: 400,
  code: 'refresh_token_already_used'
}
Auth error: Error [AuthApiError]: Invalid Refresh Token: Already Used
    at handleError (../../../src/lib/fetch.ts:102:9)
    at async _handleRequest (../../../src/lib/fetch.ts:195:5)
    at async _request (../../../src/lib/fetch.ts:157:16)
    at async (../../src/GoTrueClient.ts:2268:18)
    at async (../../../src/lib/helpers.ts:228:26) {
  __isAuthError: true,
  status: 400,
  code: 'refresh_token_already_used'
}
[04:37:08.052] INFO (#442) handleUploadAction=796ms: Sending presigned URLs to client
  presignedUrls: [
    {
      url: 'https://sea1.ingest.uploadthing.com/IdyUuc7JrxRy2D7TJfnvCU5tm6IbnuTwpfao1JeAcRKikHFq?expires=1759981028043&x-ut-identifier=8cmz7w0a3x&x-ut-file-name=istockphoto-1365118618-1024x1024.jpg&x-ut-file-size=32891&x-ut-file-type=image%252Fjpeg&x-ut-slug=workspaceImage&x-ut-content-disposition=inline&signature=hmac-sha256%3Da5935ebedb90c0d57d0831d81cc9706e29929eaccb0c71e72e7407eb3d5d43bd',
      key: 'IdyUuc7JrxRy2D7TJfnvCU5tm6IbnuTwpfao1JeAcRKikHFq',
      name: 'istockphoto-1365118618-1024x1024.jpg',
      customId: null
    }
  ]
 POST /api/uploadthing?actionType=upload&slug=workspaceImage 200 in 1140ms
 POST /api/uploadthing?slug=workspaceImage 200 in 329ms
[04:37:14.764] INFO (#452) handleCallbackRequest=389ms: Sent callback result to UploadThing
 POST /create-workspace 200 in 135ms