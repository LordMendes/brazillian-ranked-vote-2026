#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/89b31b758965b70b6ec7f557942e3ae2d4bea4a2c2250ea4d5c7808d23266859/contract';
import endContract from '../../snapshots/89b31b758965b70b6ec7f557942e3ae2d4bea4a2c2250ea4d5c7808d23266859/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, primaryKey, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'acessos_pendentes',
        columns: [
          col('created_at', 'timestamp(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('email_encrypted', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('expires_at', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('token_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'participantes_verificados',
        columns: [
          col('data_verificacao', 'timestamp(3)', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('email_hash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'votos_computados',
        columns: [
          col('data_submissao', 'timestamp(3)', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamp-string@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('ranking', 'jsonb', { notNull: true, codecRef: { codecId: 'pg/jsonb@1' } }),
          col('voto_primeiro_turno', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('voto_segundo_turno', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'acessos_pendentes',
        index: 'acessos_pendentes_token_hash_key',
        columns: ['token_hash'],
        extras: { unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'participantes_verificados',
        index: 'participantes_verificados_email_hash_key',
        columns: ['email_hash'],
        extras: { unique: true },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
