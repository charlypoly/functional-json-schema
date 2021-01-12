import { schema, types, definition } from "../lib/index";
import * as ajv from "ajv";

describe("E2E", () => {
  test("schema", () => {
    const generated = schema({
      community_list: {
        portfolio_ids: types.arrayOf("string", { required: true }),
        project_id: types.type("string", { required: true }),
        status: types.enumOf("active", "inactive"),
        user: types.anyOf(types.definition("User"), types.definition("Admin")),
      },
    });
    expect(generated).toEqual({
      type: "object",
      properties: {
        community_list: {
          type: "object",
          properties: {
            portfolio_ids: {
              type: "array",
              items: {
                type: "string",
              },
            },
            project_id: {
              type: "string",
            },
            user: {
              anyOf: [
                { $ref: "#/definitions/User" },
                { $ref: "#/definitions/Admin" },
              ],
            },
            status: {
              enum: ["active", "inactive"],
            },
          },
          required: ["portfolio_ids", "project_id"],
        },
      },
    });
    const validator = new ajv();
    expect(validator.validateSchema(generated)).toBe(true);
  });

  test("definition", () => {
    const generated = definition(
      "User",
      {
        firstName: types.type("string"),
        lastName: types.type("string"),
        jobTitle: types.type("string"),
        companyId: types.type("string"),
      },
      { title: "User", description: "Fake User Object" }
    );
    expect(generated).toEqual({
      $ref: "#/definitions/User",
      definitions: {
        User: {
          type: "object",
          title: "User",
          description: "Fake User Object",
          properties: {
            firstName: {
              type: "string",
            },
            lastName: {
              type: "string",
            },
            jobTitle: {
              type: "string",
            },
            companyId: {
              type: "string",
            },
          },
          required: [],
        },
      },
    });
    const validator = new ajv();
    expect(validator.validateSchema(generated)).toBe(true);
  });
});
