import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintNotificationsReminderType20260601 implements MigrationInterface {
  name = 'AddUniqueConstraintNotificationsReminderType20260601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "uq_notifications_reminder_type" UNIQUE ("reminder_id","type")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "uq_notifications_reminder_type"`);
  }
}
