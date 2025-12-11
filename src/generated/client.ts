/* eslint-disable */
/* GraphQL Client - Generated once by tangen. Customize as needed. */

import { createServerFn } from "@tanstack/react-start";
import { GraphQLClient } from "graphql-request";

const endpoint = "https://api.github.com/graphql";

const getToken = createServerFn().handler(() => process.env.GITHUB_TOKEN);

/**
 * Returns a GraphQL client instance for GitHub's GraphQL API.
 * Uses the GITHUB_TOKEN environment variable for authentication.
 */
export const getClient = async () => {
	const token = await getToken();

	return new GraphQLClient(endpoint, {
		headers: {
			"Content-Type": "application/json",
			...(token && { Authorization: `token ${token}` }),
		},
	});
};
