import { test } from "node:test";
import assert from "node:assert/strict";
import { newPasswordError } from "../lib/password.ts";

test("valida la contraseña nueva", () => {
  assert.match(newPasswordError("abc", "abc")!, /6 caracteres/);
  assert.match(newPasswordError("abcdef", "abcdeg")!, /no coincide/);
  assert.match(newPasswordError("abcdef", "abcdef", "abcdef")!, /distinta/);
  assert.equal(newPasswordError("abcdef", "abcdef", "viejo1"), undefined);
  assert.equal(newPasswordError("abcdef", "abcdef"), undefined);
});
