import assert from "assert";
import { foo } from "../index";

describe("index", () => {
    it("should be return foo", () => {
        assert.equal(foo(), "foo");
    });
});
