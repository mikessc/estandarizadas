import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBulk } from "../lib/bulk.ts";

test("valida cada línea de la lista de alumnos", () => {
  const rows = parseBulk(
    ["Ana Mora, ANA@x.cr, secreto1", "", "Beto\tbeto@x.cr\tsecreto2", "Ana 2, ana@x.cr, secreto3", "Caro, caro@x.cr, secreto4",
      "Dani, dani-sin-arroba, secreto5", "Eva, eva@x.cr,", "Fer, fer@x.cr, 123", "Gabi, g@x.cr, clave12, extra"].join("\n"),
    new Set(["caro@x.cr"]),
  );
  assert.deepEqual(
    rows.map((r) => [r.line, r.errors]),
    [
      [1, []],
      [3, []],
      [4, ["Correo repetido en la lista"]],
      [5, ["El correo ya existe"]],
      [6, ["Correo inválido"]],
      [7, ["Contraseña vacía"]],
      [8, ["Contraseña de menos de 6 caracteres"]],
      [9, ["Formato inválido: sobran columnas"]],
    ],
  );
  assert.deepEqual([rows[0].name, rows[0].email, rows[0].password], ["Ana Mora", "ana@x.cr", "secreto1"]);
  assert.equal(rows[1].email, "beto@x.cr");
});
