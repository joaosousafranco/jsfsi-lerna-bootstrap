// import { HttpRequest, HttpMethods } from '@jsfsi-core/typescript-cross-platform'
// import { executeShell } from '@jsfsi-core/typescript-nodejs'

import 'cross-fetch/polyfill'
import { executeShell } from '@jsfsi-core/typescript-nodejs'
import { Configuration } from '../configuration/Configuration'
import ApolloClient, { gql, ApolloError } from 'apollo-boost'
import { Login } from '../../src/communication/graphql/types/Login'

const graphqlClient = new ApolloClient({
    uri: `${Configuration.baseUrl}${Configuration.graphqlPath}`,
    onError: _ => {},
})

const loginMutation = gql`
    mutation LoginWithGoogle($accessToken: String!) {
        loginWithGoogle(accessToken: $accessToken) {
            token
        }
    }
`

describe('Login using graphql and google', () => {
    it('with success', async () => {
        const googleAccessToken = await executeShell('gcloud auth print-access-token')

        const token = await graphqlClient.mutate<{ loginWithGoogle: Login }>({
            mutation: loginMutation,
            variables: {
                accessToken: googleAccessToken,
            },
        })

        expect(token?.data?.loginWithGoogle?.token).toBeTruthy()
    })

    it('with invalid token', async () => {
        try {
            await graphqlClient.mutate<{ loginWithGoogle: Login }>({
                mutation: loginMutation,
                variables: {
                    accessToken: 'test',
                },
            })
        } catch (error) {
            const apolloError = error as ApolloError
            expect(apolloError.graphQLErrors[0].extensions['code']).toBe('UNAUTHENTICATED')
        }
    })
})
