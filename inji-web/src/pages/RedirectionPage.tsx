import React, {useEffect, useState} from 'react';
import {getActiveSession, removeActiveSession} from "../utils/sessions";
import {useLocation} from "react-router-dom";
import {NavBar} from "../components/Common/NavBar";
import {RequestStatus, useFetch} from "../hooks/useFetch";
import {DownloadResult} from "../components/Redirection/DownloadResult";
import {api} from "../utils/api";
import {ApiRequest, DisplayArrayObject, SessionObject} from "../types/data";
import {useTranslation} from "react-i18next";
import {downloadCredentialPDF} from "../utils/misc";
import {getObjectForCurrentLanguage} from "../utils/i18n";
//var Buffer = require('buffer/').Buffer 
const jose = require("jose");
export const RedirectionPage: React.FC = () => {

    const {error, state, fetchRequest} = useFetch();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const redirectedSessionId = searchParams.get("state");
    const activeSessionInfo: any = getActiveSession(redirectedSessionId);
    const {t} = useTranslation("RedirectionPage");
    const [session, setSession] = useState<SessionObject | null>(activeSessionInfo);
    const displayObject = getObjectForCurrentLanguage(session?.selectedIssuer?.display ?? []);
    const alg = "RS256";
    const jweEncryAlgo = "RSA-OAEP-256";
    const expirationTime = "1h";
    useEffect(() => {
        
         fetchToken();

    }, [])
    const fetchToken = async () => {
        if (Object.keys(activeSessionInfo).length > 0) {
            const code = searchParams.get("code") ?? "";
            const urlState = searchParams.get("state") ?? "";
            const clientId = activeSessionInfo?.selectedIssuer.client_id;
            const codeVerifier = activeSessionInfo?.codeVerifier;
            const issuerId = activeSessionInfo?.selectedIssuer.credential_issuer ?? "";
            const certificateId = activeSessionInfo?.certificateId;

            const bodyJson = {
                'grant_type': 'authorization_code',
                'code': code,
                'client_id': clientId,
                'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                'client_assertion': '',
                'redirect_uri': api.authorizationRedirectionUrl,
                'code_verifier': codeVerifier,
            }
            const requestBody = new URLSearchParams(bodyJson);

            let apiRequest: ApiRequest = api.fetchToken;
            let response = await fetchRequest(
                apiRequest.url(issuerId),
                apiRequest.methodType,
                apiRequest.headers(),
                requestBody
            );

            apiRequest = api.downloadVc;
            // response = await fetchRequest(
            //     apiRequest.url(issuerId, certificateId),
            //     apiRequest.methodType,
            //     apiRequest.headers(response?.access_token)
            // );
            // if (state !== RequestStatus.ERROR) {
            //     await downloadCredentialPDF(response, certificateId);
            // }
            // if (urlState != null) {
            //     removeActiveSession(urlState);
            // }
        } else {
            setSession(null);
        }
    }
    const generateSignedJwt = async (clientId:any) => {
        // Set headers for JWT
        var header = {
          alg: alg,
          typ: "JWT",
        };
      
        var payload = {
          iss: clientId,
          sub: clientId,
          aud: "http://20.193.138.163/v1/esignet/oauth/v2/token",
        };
      
       // var decodeKey = Buffer.from("ewogICAgImt0eSI6ICJSU0EiLAogICAgICAgICJrZXlfb3BzIjogWwogICAgICAgICAgICAic2lnbiIsCiAgICAgICAgICAgICJ2ZXJpZnkiLAogICAgICAgICAgICAiZW5jcnlwdCIsCiAgICAgICAgICAgICJkZWNyeXB0IgogICAgICAgIF0sCiAgICAgICAgICAgICJraWQiOiAiZGYwOGVjMjEtOWNlYy00Zjc3LTgxYWItNTAxMTkzNzI3MzgxIiwKICAgICAgICAgICAgICAgICJkIjogIkM2N25YeVZkRmd5bmc1YklvUEpGSDBWQ19Dak83bDlEMVFBYm85dW1RNGtYd0dmZ3V6RWpraUJhRDJtTzFDYUE0RnJpYXpHR2tVNUNkd21ES084TWkzUEJIaHdEMXB1djVjWG0xdHJ5NEVzb01vY2VzRjEyM2c0dkpibjY1ZnJuY0lON3RYT3lCT0t4LWoxUlpUZWZ3SlRiNjBISzBNSzBWWEFyRWduWkZsSVZNRkFSUHJUTm9zWF82LXhfS3pDclA5Vl9iLUlXSVc5cjRaS2I4LVM0U1l3TEQwSzRPd0hvenZmMkcyQzZaZ1JyM0FnTFd1VVo5VnpJZGxVUzJGQklTSEduTUJyd0Z0RDBESkx3d25vRmowLTJDN0RrcnBFY2RPaDJrNGFEN2VhYXMyVERLRHVub1NhRVVpZXdfeTl4ZFN4VS1TNHNBaUhqeWRrR3gxMXlHUSIsCiAgICAgICAgICAgICAgICAgICAgIm4iOiAid1RVN1hrdVlGdG5MYnU3bFRjVFZSWGVXSnRfV0ZuNGJpU0w5RjBZWW42Uy1BM2JlU051Tk9qS0dfbHhDeG1hRW5BMWJhUmk1dFAyNWFnREpzOG5WWmVPLU94MkVoNV9JU0RVQ2NHTFJIaXRQNHdRbDh6ZzNBWTI5ZFhKUU9rRVRxaVVYNVpzUWdvaDhXSlVSU0RpbWFxQWE0VXdxU0ZGMnJNUW1wSVpPYnF4ZlhvRDIxa0Q5UzlVRVI4U1Q2ODN5T245QzdsN3JqOGRpM1RpdkFaWEVLUm0xU0xGZk5sdzdNQUFtMnZEb3d0MFNIMV8teDlENFQzNlhNOF9LbkRDb19waG5FR0c5Q1F6WHBZVG40aXNISmFnUHZzLW1mb3pKbWp5SktEdnpjaXNaSHI2OVJOSm92SDFhZkxKc1UzZXRDeTJNeG43c1VDa2VqcHlTaE1YcEp3IiwKICAgICAgICAgICAgICAgICAgICAgICAgImUiOiAiQVFBQiIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAicCI6ICI0SEVyaXU1V3h5NnlSWnVIUkxpck1VSFNCNUhFQnpnQVI1eW9sV0FMUnVadTRMUmJWY21RUVBGTHVweVcwVXQzbDM2ZnB3MUVHSkNJUFJEbjl4Q1hhUU50QzBZS1d0YXhBaWpTSjhXZ3dRdkJ3Mzd0R3RjcWxER3JNZTMtQ2kxamt6Z0N6VFFoS3FkRGtFRkJzcHgyQnh6RVVidkhVcWtRQmlzdjZjX1pBTXMiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICJxIjogIjNGX0lzU3RKZUh1WjBWaXdGOXdpSk44TVBNSWVXTmZXeUlET1JncXBqSTJEdGE2a081SC05UFN3M1hZTHIwbDZyTXA4MERUX2FqYU1qWHZpNTgzTmlROEJROGFXS09vaXpaSjM0V3Ezbm5MMlM0TlVKZ01nSDdQVU80UVNKampMWEN2alh3dEhQekdUR1FfM0pLRzV0YWM4LU12YXVxUjB3NmREaU5XNS1aVSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICJkcCI6ICJ3MzF2T3J5c015T1dQWkRoT2xkTExVVXlaa3R0bmdnR0hsbnljT0ZPRVR4RzJVdmV2aE1wcFpkR3FjMFloRVlpYlg3cUdud3drdURZLWEtUERDQ1VjUEI5LXpMUGRCM0o0YUtpb2VlLVJFYzBSMDUzd1VnbW14dkVER0pLUXAwVVBUZXRJUVZGMmp3RVdsS3NvYUVzSUxmS3U1SS1ZOTVEeWN1MkdRWmo4ZzgiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImRxIjogIkNVN0NXemxJMFIzblVVQTlyOFJNYk9JLTBoSWcxZl9Id3BBdUppY3RJaEtZRFlSaXkyRlBNMmxpVHZnOVpobmtaSWZvM2FKZlowMEdnck5JMGlHUEhNclZjdGRnWURvRFhrdGhaTlB0RFhRdGt1THBHdkhtMldfdTl0U05MN0FXWnI0enpEX2RzbjJWaU9senRzaGQzNTVBcFFGM0s0cm1vNXpjN1ZxWmtFRSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInFpIjogIm02dTVzNUhFcmF3YlpXN0JhSHhtQmNHOGVkc0xqamVERFVaZ0xSV3pqS2NPRVpVZ3hUanBlckFvWFdfZ084ZlJCN2YyaC1UZnVaZEhZTXlJdHY0b2YtQlh4MGVtUzZtOG92NGlzLW80aFVqeGxYUkJ0U3lheTRmckM5TUJSUzdKNG9tTGJPOXhCOFhGZ2RqbS16a2x5X3BDNlVaSkQycjJlSmpsNDNHYi01TSIKfQ==", 'base64')?.toString();
        var decodeKey = "{\"kty\": \"RSA\", \"key_ops\": [\"sign\",\"verify\",\"encrypt\",\"decrypt\" ],\"kid\": \"df08ec21-9cec-4f77-81ab-501193727381\",  \"d\": \"C67nXyVdFgyng5bIoPJFH0VC_CjO7l9D1QAbo9umQ4kXwGfguzEjkiBaD2mO1CaA4FriazGGkU5CdwmDKO8Mi3PBHhwD1puv5cXm1try4EsoMocesF123g4vJbn65frncIN7tXOyBOKx-j1RZTefwJTb60HK0MK0VXArEgnZFlIVMFARPrTNosX_6-x_KzCrP9V_b-IWIW9r4ZKb8-S4SYwLD0K4OwHozvf2G2C6ZgRr3AgLWuUZ9VzIdlUS2FBISHGnMBrwFtD0DJLwwnoFj0-2C7DkrpEcdOh2k4aD7eaas2TDKDunoSaEUiew_y9xdSxU-S4sAiHjydkGx11yGQ\", \"n\": \"wTU7XkuYFtnLbu7lTcTVRXeWJt_WFn4biSL9F0YYn6S-A3beSNuNOjKG_lxCxmaEnA1baRi5tP25agDJs8nVZeO-Ox2Eh5_ISDUCcGLRHitP4wQl8zg3AY29dXJQOkETqiUX5ZsQgoh8WJURSDimaqAa4UwqSFF2rMQmpIZObqxfXoD21kD9S9UER8ST683yOn9C7l7rj8di3TivAZXEKRm1SLFfNlw7MAAm2vDowt0SH1_-x9D4T36XM8_KnDCo_phnEGG9CQzXpYTn4isHJagPvs-mfozJmjyJKDvzcisZHr69RNJovH1afLJsU3etCy2Mxn7sUCkejpyShMXpJw\",\"e\": \"AQAB\", \"p\": \"4HEriu5Wxy6yRZuHRLirMUHSB5HEBzgAR5yolWALRuZu4LRbVcmQQPFLupyW0Ut3l36fpw1EGJCIPRDn9xCXaQNtC0YKWtaxAijSJ8WgwQvBw37tGtcqlDGrMe3-Ci1jkzgCzTQhKqdDkEFBspx2BxzEUbvHUqkQBisv6c_ZAMs\",\"q\": \"3F_IsStJeHuZ0ViwF9wiJN8MPMIeWNfWyIDORgqpjI2Dta6kO5H-9PSw3XYLr0l6rMp80DT_ajaMjXvi583NiQ8BQ8aWKOoizZJ34Wq3nnL2S4NUJgMgH7PUO4QSJjjLXCvjXwtHPzGTGQ_3JKG5tac8-MvauqR0w6dDiNW5-ZU\",  \"dp\": \"w31vOrysMyOWPZDhOldLLUUyZkttnggGHlnycOFOETxG2UvevhMppZdGqc0YhEYibX7qGnwwkuDY-a-PDCCUcPB9-zLPdB3J4aKioee-REc0R053wUgmmxvEDGJKQp0UPTetIQVF2jwEWlKsoaEsILfKu5I-Y95Dycu2GQZj8g8\", \"dq\": \"CU7CWzlI0R3nUUA9r8RMbOI-0hIg1f_HwpAuJictIhKYDYRiy2FPM2liTvg9ZhnkZIfo3aJfZ00GgrNI0iGPHMrVctdgYDoDXkthZNPtDXQtkuLpGvHm2W_u9tSNL7AWZr4zzD_dsn2ViOlztshd355ApQF3K4rmo5zc7VqZkEE\",\"qi\": \"m6u5s5HErawbZW7BaHxmBcG8edsLjjeDDUZgLRWzjKcOEZUgxTjperAoXW_gO8fRB7f2h-TfuZdHYMyItv4of-BXx0emS6m8ov4is-o4hUjxlXRBtSyay4frC9MBRS7J4omLbO9xB8XFgdjm-zkly_pC6UZJD2r2eJjl43Gb-5M\" }";
        console.log(decodeKey);
        const jwkObject = JSON.parse(decodeKey);
        console.log("aaaa" , jwkObject);
        const privateKey = await jose.importJWK(jwkObject, alg);
        //var privateKey = await jose.importPKCS8(jwkObject, alg);
    
        console.log(privateKey);
        const jwt = new jose.SignJWT(payload)
          .setProtectedHeader(header)
          .setIssuedAt()
          .setExpirationTime(expirationTime)
          .sign(privateKey);
      
        console.log(jwt);
        return jwt;
      };

      const generateSignedJwt1 = async (clientId: any): Promise<string> => {
        const alg: string = 'RS256';
        const expirationTime: number = Math.floor(Date.now() / 1000) + 60 * 60;
      
        const header = {
          alg: alg,
          typ: 'JWT',
        };
      
        const payload = {
          iss: clientId,
          sub: clientId,
          aud: 'http://20.193.138.163/v1/esignet/oauth/v2/token',
        };
        var decodeKey = "{\"kty\": \"RSA\", \"key_ops\": [\"sign\",\"verify\",\"encrypt\",\"decrypt\" ],\"kid\": \"df08ec21-9cec-4f77-81ab-501193727381\",  \"d\": \"C67nXyVdFgyng5bIoPJFH0VC_CjO7l9D1QAbo9umQ4kXwGfguzEjkiBaD2mO1CaA4FriazGGkU5CdwmDKO8Mi3PBHhwD1puv5cXm1try4EsoMocesF123g4vJbn65frncIN7tXOyBOKx-j1RZTefwJTb60HK0MK0VXArEgnZFlIVMFARPrTNosX_6-x_KzCrP9V_b-IWIW9r4ZKb8-S4SYwLD0K4OwHozvf2G2C6ZgRr3AgLWuUZ9VzIdlUS2FBISHGnMBrwFtD0DJLwwnoFj0-2C7DkrpEcdOh2k4aD7eaas2TDKDunoSaEUiew_y9xdSxU-S4sAiHjydkGx11yGQ\", \"n\": \"wTU7XkuYFtnLbu7lTcTVRXeWJt_WFn4biSL9F0YYn6S-A3beSNuNOjKG_lxCxmaEnA1baRi5tP25agDJs8nVZeO-Ox2Eh5_ISDUCcGLRHitP4wQl8zg3AY29dXJQOkETqiUX5ZsQgoh8WJURSDimaqAa4UwqSFF2rMQmpIZObqxfXoD21kD9S9UER8ST683yOn9C7l7rj8di3TivAZXEKRm1SLFfNlw7MAAm2vDowt0SH1_-x9D4T36XM8_KnDCo_phnEGG9CQzXpYTn4isHJagPvs-mfozJmjyJKDvzcisZHr69RNJovH1afLJsU3etCy2Mxn7sUCkejpyShMXpJw\",\"e\": \"AQAB\", \"p\": \"4HEriu5Wxy6yRZuHRLirMUHSB5HEBzgAR5yolWALRuZu4LRbVcmQQPFLupyW0Ut3l36fpw1EGJCIPRDn9xCXaQNtC0YKWtaxAijSJ8WgwQvBw37tGtcqlDGrMe3-Ci1jkzgCzTQhKqdDkEFBspx2BxzEUbvHUqkQBisv6c_ZAMs\",\"q\": \"3F_IsStJeHuZ0ViwF9wiJN8MPMIeWNfWyIDORgqpjI2Dta6kO5H-9PSw3XYLr0l6rMp80DT_ajaMjXvi583NiQ8BQ8aWKOoizZJ34Wq3nnL2S4NUJgMgH7PUO4QSJjjLXCvjXwtHPzGTGQ_3JKG5tac8-MvauqR0w6dDiNW5-ZU\",  \"dp\": \"w31vOrysMyOWPZDhOldLLUUyZkttnggGHlnycOFOETxG2UvevhMppZdGqc0YhEYibX7qGnwwkuDY-a-PDCCUcPB9-zLPdB3J4aKioee-REc0R053wUgmmxvEDGJKQp0UPTetIQVF2jwEWlKsoaEsILfKu5I-Y95Dycu2GQZj8g8\", \"dq\": \"CU7CWzlI0R3nUUA9r8RMbOI-0hIg1f_HwpAuJictIhKYDYRiy2FPM2liTvg9ZhnkZIfo3aJfZ00GgrNI0iGPHMrVctdgYDoDXkthZNPtDXQtkuLpGvHm2W_u9tSNL7AWZr4zzD_dsn2ViOlztshd355ApQF3K4rmo5zc7VqZkEE\",\"qi\": \"m6u5s5HErawbZW7BaHxmBcG8edsLjjeDDUZgLRWzjKcOEZUgxTjperAoXW_gO8fRB7f2h-TfuZdHYMyItv4of-BXx0emS6m8ov4is-o4hUjxlXRBtSyay4frC9MBRS7J4omLbO9xB8XFgdjm-zkly_pC6UZJD2r2eJjl43Gb-5M\" }";
        const jwkObject = JSON.parse(decodeKey);

        const privateKey = await jose.importJWK(jwkObject, alg);
      
        const jwt = await new jose.SignJWT(payload)
          .setProtectedHeader(header)
          .setIssuedAt()
          .setExpirationTime(expirationTime)
          .sign(privateKey);
      
        return jwt;
      };
        
    const loadStatusOfRedirection = () => {
        if (!session) {
            return <DownloadResult title={t("error.invalidSession.title")}
                                   subTitle={t("error.invalidSession.subTitle")}
                                   state={RequestStatus.ERROR}/>
        }
        if (state === RequestStatus.LOADING) {
            return <DownloadResult title={t("loading.title")}
                            subTitle={t("loading.subTitle")}
                            state={RequestStatus.LOADING}/>
        }
        if (state === RequestStatus.ERROR && error) {
            return <DownloadResult title={t("error.generic.title")}
                                   subTitle={t("error.generic.subTitle")}
                                   state={RequestStatus.ERROR}/>
        }
        return <DownloadResult title={t("success.title")}
                               subTitle={t("success.subTitle")}
                               state={RequestStatus.DONE}/>
    }

    return <div data-testid="Redirection-Page-Container">
        <NavBar title={displayObject?.name ?? ""} search={false} link={`/issuers/${activeSessionInfo?.selectedIssuer?.credential_issuer}`}/>
        {loadStatusOfRedirection()}
    </div>
}
