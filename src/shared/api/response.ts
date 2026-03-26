import { NextResponse } from "next/server";
import { AppError } from "@/src/shared/errors/app-error";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        details: error.details ?? null,
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Error interno del servidor",
    },
    { status: 500 },
  );
}
