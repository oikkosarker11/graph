import { execute, parse } from "graphql";
import 'graphql-import-node';
import { schema } from "./schema";

async function main() {
  const myQuery = parse(`query {
  feed {
    id
    url
    description
  }
}`); // ✅ Fixed query parsing

  const result = await execute({
    schema,
    document: myQuery,
  });

  // Convert to a normal object to remove "[Object: null prototype]"
  // const normalizedResult = JSON.parse(JSON.stringify(result));

  // console.log(normalizedResult); // ✅ Should now show { data: { info: 'Test' } }

  console.log(JSON.stringify(result, null, 2));
}


main();
