
export const data = {
  "agentLogs": [
    {
      "_id": "636d54c336f130ed5d11d0ca",
      "agentId": "fb07af89-8f21-4203-9850-47a46a878f08",
      "level": "TRACE",
      "app": "Adam",
      "agentName": "TestAgent1",
      "ipAddress": "169.254.86.30",
      "macAddress": "8c:8c:aa:30:8e:c7",
      "content": "[2022-11-11 01:14:10.808740500 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener stopped on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n[2022-11-11 01:14:10.850951900 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Heartbeat Response from Integration Manager - {[] RUNNING %!s(int=5)}\n[2022-11-11 01:14:10.855871900 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Uploading chunk 1/1  of  Name1.json for flow  F-F\n[2022-11-11 01:14:43.647663800 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Making Request at -: https://localhost:10443/b2b/bm/Adam/agent/utils/fb07af89-8f21-4203-9850-47a46a878f08/upload\n[2022-11-11 01:14:43.661142800 +0530 IST] [DEBUG] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Request Headers -: map[Authorization:[JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJBR0VOVDAwMDEiLCJhcHAiOiJBZGFtIiwidHlwZSI6IkFQUEFHRU5UIiwibmFtZSI6IlRlc3RBZ2VudDEiLCJlbmNyeXB0RmlsZSI6ZmFsc2UsInJldGFpbkZpbGVPblN1Y2Nlc3MiOnRydWUsInJldGFpbkZpbGVPbkVycm9yIjp0cnVlLCJpbnRlcm5hbCI6ZmFsc2UsImFjdGl2ZSI6dHJ1ZSwiX21ldGFkYXRhIjp7Imxhc3RVcGRhdGVkIjoiMjAyMi0xMS0wOVQxMDoyNTo0Ni42MTVaIiwiY3JlYXRlZEF0IjoiMjAyMi0wOS0wNlQxMjowNDozMy42NzdaIiwiZGVsZXRlZCI6ZmFsc2UsInZlcnNpb24iOnsiZG9jdW1lbnQiOjM1LCJfaWQiOiI2MzE3Mzc1MTM0MTE2OTNkMGNkZGZlZjcifSwiX2lkIjoiNjMxNzM3NTEzNDExNjkzZDBjZGRmZWY2In0sImFnZW50SWQiOiJmYjA3YWY4OS04ZjIxLTQyMDMtOTg1MC00N2E0NmE4NzhmMDgiLCJfX3YiOjAsImxhc3RMb2dnZWRJbiI6IjIwMjItMTEtMDlUMTA6MjU6NDYuNTk2WiIsImlhdCI6MTY2ODEwODkwNCwiZXhwIjoxNjY4MTE2MTA0fQ.DUR2CTiFGqkjFOYY6e9vXwjVgcqV0x1ELObzNVcc7vA] Content-Type:[multipart/form-data; boundary=fc7c800ec3a7d9ed4b44f7a30f6c4dddacd32c91feccdde7c139764e3d2c] Data-Stack-Agent-Id:[fb07af89-8f21-4203-9850-47a46a878f08] Data-Stack-Agent-Name:[TestAgent1] Data-Stack-Agent-Release:[] Data-Stack-App-Name:[Adam] Data-Stack-Bufferencryption:[true] Data-Stack-Chunk-Checksum:[768fa2efd4895dc030792de08db1325e] Data-Stack-Compression:[true] Data-Stack-Current-Chunk:[1] Data-Stack-Deployment-Name:[] Data-Stack-File-Checksum:[f855a7d932513bea72c23f29b5858ed5] Data-Stack-File-Size:[0] Data-Stack-File-Token:[eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJBR0VOVDAwMDEiLCJhcHAiOiJBZGFtIiwidHlwZSI6IkFQUEFHRU5UIiwibmFtZSI6IlRlc3RBZ2VudDEiLCJlbmNyeXB0RmlsZSI6ZmFsc2UsInJldGFpbkZpbGVPblN1Y2Nlc3MiOnRydWUsInJldGFpbkZpbGVPbkVycm9yIjp0cnVlLCJpbnRlcm5hbCI6ZmFsc2UsImFjdGl2ZSI6dHJ1ZSwiX21ldGFkYXRhIjp7Imxhc3RVcGRhdGVkIjoiMjAyMi0xMS0wOVQxMDoyNTo0Ni42MTVaIiwiY3JlYXRlZEF0IjoiMjAyMi0wOS0wNlQxMjowNDozMy42NzdaIiwiZGVsZXRlZCI6ZmFsc2UsInZlcnNpb24iOnsiZG9jdW1lbnQiOjM1LCJfaWQiOiI2MzE3Mzc1MTM0MTE2OTNkMGNkZGZlZjcifSwiX2lkIjoiNjMxNzM3NTEzNDExNjkzZDBjZGRmZWY2In0sImFnZW50SWQiOiJmYjA3YWY4OS04ZjIxLTQyMDMtOTg1MC00N2E0NmE4NzhmMDgiLCJfX3YiOjAsImxhc3RMb2dnZWRJbiI6IjIwMjItMTEtMDlUMTA6MjU6NDYuNTk2WiIsImlhdCI6MTY2ODEwODkwNCwiZXhwIjoxNjY4MTE2MTA0fQ.DUR2CTiFGqkjFOYY6e9vXwjVgcqV0x1ELObzNVcc7vA] Data-Stack-Flow-Id:[FLOW0006] Data-Stack-Flow-Name:[F-F] Data-Stack-Mirror-Directory:[] Data-Stack-New-File-Location:[C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\bin\\\\..\\\\data\\Adam\\F-F\\processing\\2022_11_11_01_11_08_000000____Name1.jsonprocessing] Data-Stack-New-File-Name:[2022_11_11_01_11_08_000000____Name1.jsonprocessing] Data-Stack-Operating-System:[windows] Data-Stack-Original-File-Name:[Name1.json] Data-Stack-Remote-Txn-Id:[Name1.json] Data-Stack-Symmetric-Key:[34857057658800771270426551038148] Data-Stack-Total-Chunks:[1] Data-Stack-Txn-Id:[fbfecab9-69ee-4b8a-8320-cb850bc01aae] Data-Stack-Unique-Id:[a34b5831-dcc5-4bf5-a30a-c911a6067560]]\n",
      "timestamp": "2022-11-10T19:45:07.573Z",
      "_metadata": {
        "lastUpdated": "2022-11-10T20:02:27.345Z",
        "createdAt": "2022-11-10T19:45:07.587Z",
        "deleted": false,
        "version": {
          "document": 2,
          "_id": "636d54c336f130ed5d11d0cc"
        },
        "_id": "636d54c336f130ed5d11d0cb"
      },
      "__v": 0
    },
    {
      "_id": "636d553136f130ed5d11d0dc",
      "agentId": "fb07af89-8f21-4203-9850-47a46a878f08",
      "level": "INFO",
      "app": "Adam",
      "agentName": "TestAgent1",
      "ipAddress": "169.254.86.30",
      "macAddress": "8c:8c:aa:30:8e:c7",
      "content": "[2022-11-11 01:14:53.650625100 +0530 IST] [TRACE] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Heartbeat Headers 10\n[2022-11-11 01:15:06.004873700 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener started on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n[2022-11-11 01:15:07.589414600 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Making Request at -: https://localhost:10443/b2b/bm/Adam/agent/utils/fb07af89-8f21-4203-9850-47a46a878f08/heartbeat\n[2022-11-11 01:15:07.592590800 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener stopped on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n[2022-11-11 01:15:07.720308500 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Heartbeat Response from Integration Manager - {[] RUNNING %!s(int=5)}\n[2022-11-11 01:15:07.842255100 +0530 IST] [ERROR] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] {\"message\":\"Chunk Successfully Uploaded\"}\n",
      "timestamp": "2022-11-10T19:46:57.319Z",
      "_metadata": {
        "lastUpdated": "2022-11-10T20:02:27.347Z",
        "createdAt": "2022-11-10T19:46:57.339Z",
        "deleted": false,
        "version": {
          "document": 2,
          "_id": "636d553136f130ed5d11d0de"
        },
        "_id": "636d553136f130ed5d11d0dd"
      },
      "__v": 0
    },
    {
      "_id": "636d554236f130ed5d11d0e4",
      "agentId": "fb07af89-8f21-4203-9850-47a46a878f08",
      "level": "DEBUG",
      "app": "Adam",
      "agentName": "TestAgent1",
      "ipAddress": "169.254.86.30",
      "macAddress": "8c:8c:aa:30:8e:c7",
      "content": "[2022-11-11 01:15:17.772110900 +0530 IST] [TRACE] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Heartbeat Headers 10\n[2022-11-11 01:16:06.013361500 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener started on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n[2022-11-11 01:16:57.346364400 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Chunk 1/1 of Name1.json for flow F-F uploaded successfully\n[2022-11-11 01:16:57.347451500 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener stopped on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n[2022-11-11 01:16:57.348602200 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Making Request at -: https://localhost:10443/b2b/bm/Adam/agent/utils/fb07af89-8f21-4203-9850-47a46a878f08/heartbeat\n[2022-11-11 01:16:57.368198400 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Successfully uploaded file C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input\\Name1.json for fbfecab9-69ee-4b8a-8320-cb850bc01aae\n",
      "timestamp": "2022-11-10T19:47:14.845Z",
      "_metadata": {
        "lastUpdated": "2022-11-10T20:02:27.348Z",
        "createdAt": "2022-11-10T19:47:14.849Z",
        "deleted": false,
        "version": {
          "document": 2,
          "_id": "636d554236f130ed5d11d0e6"
        },
        "_id": "636d554236f130ed5d11d0e5"
      },
      "__v": 0
    },
    {
      "_id": "636d555f36f130ed5d11d0e8",
      "agentId": "fb07af89-8f21-4203-9850-47a46a878f08",
      "level": "ERROR",
      "app": "Adam",
      "agentName": "TestAgent1",
      "ipAddress": "169.254.86.30",
      "macAddress": "8c:8c:aa:30:8e:c7",
      "content": "[2022-11-11 01:16:57.413146700 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Heartbeat Response from Integration Manager - {[{ fb07af89-8f21-4203-9850-47a46a878f08 Adam TestAgent1 F-F FLOW0006  FILE_PROCESSED_SUCCESS {\"originalFileName\":\"Name1.json\",\"newFileName\":\"2022_11_11_01_11_08_000000____Name1.jsonprocessing\",\"newLocation\":\"C:\\\\\\\\Users\\\\Sushmitha Prasad\\\\Desktop\\\\Runnables\\\\LocalAgents\\\\TestAgent1_windows_amd64\\\\bin\\\\\\\\..\\\\\\\\data\\\\Adam\\\\F-F\\\\processing\\\\2022_11_11_01_11_08_000000____Name1.jsonprocessing\",\"mirrorPath\":\"\",\"md5CheckSum\":\"f855a7d932513bea72c23f29b5858ed5\",\"remoteTxnID\":\"Name1.json\",\"dataStackTxnID\":\"fbfecab9-69ee-4b8a-8320-cb850bc01aae\"} 2022-11-10 19:45:07.826 +0000 UTC  %!s(bool=false) }] RUNNING %!s(int=5)}\n[2022-11-11 01:17:14.852324800 +0530 IST] [DEBUG] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Upload Block Opened for Count -: %!(EXTRA int=1)\n[2022-11-11 01:17:06.010396400 +0530 IST] [INFO] [TestAgent1] [fb07af89-8f21-4203-9850-47a46a878f08] Listener started on C:\\Users\\Sushmitha Prasad\\Desktop\\Runnables\\LocalAgents\\TestAgent1_windows_amd64\\data\\Adam\\F-F\\input \n",
      "timestamp": "2022-11-10T19:47:43.265Z",
      "_metadata": {
        "lastUpdated": "2022-11-10T20:02:27.349Z",
        "createdAt": "2022-11-10T19:47:43.284Z",
        "deleted": false,
        "version": {
          "document": 2,
          "_id": "636d555f36f130ed5d11d0ea"
        },
        "_id": "636d555f36f130ed5d11d0e9"
      },
      "__v": 0
    }
  ]
}