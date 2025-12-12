/* eslint-disable */
/* GraphQL Client - Generated once by tangen. Customize as needed. */

import { createServerFn } from "@tanstack/react-start"
import { GraphQLClient } from "graphql-request"

const endpoint = "https://api.github.com/graphql"

const getToken = createServerFn().handler(() => process.env.GITHUB_TOKEN);

/**
 * Returns a GraphQL client instance.
 * Customize this function to add dynamic headers (e.g., auth tokens).
 */
export const getClient = async () => {
	const token = await getToken();

	return new GraphQLClient(endpoint, {
		headers: {
			Authorization: `token ${token}`
		},
	})
}
