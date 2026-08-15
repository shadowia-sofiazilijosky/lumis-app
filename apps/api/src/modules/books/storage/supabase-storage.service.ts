import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

const SIGNED_URL_EXPIRES_IN_SECONDS = 60 * 60; // 1 hour

@Injectable()
export class SupabaseStorageService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly client: ReturnType<typeof createClient>;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    this.bucket = this.configService.getOrThrow<string>(
      'SUPABASE_STORAGE_BUCKET',
    );

    // Placeholder values keep the client constructible (and the rest of the
    // app booting) before real Supabase Storage credentials are set — calls
    // will just fail clearly until then, instead of crashing at startup.
    this.client = createClient(
      url || 'http://localhost',
      serviceRoleKey || 'placeholder',
      { auth: { persistSession: false } },
    );
  }

  onModuleInit(): void {
    if (!this.configService.get<string>('SUPABASE_URL')) {
      this.logger.warn(
        'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY no están configurados — la subida de libros va a fallar hasta que se completen en .env.',
      );
    }
  }

  async upload(
    path: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buffer, { contentType, upsert: false });

    if (error) {
      throw new Error(
        `No se pudo subir el archivo a Supabase Storage: ${error.message}`,
      );
    }
  }

  async remove(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    const { error } = await this.client.storage.from(this.bucket).remove(paths);
    if (error) {
      this.logger.error(
        `No se pudieron borrar archivos de storage: ${error.message}`,
      );
    }
  }

  async createSignedUrl(path: string): Promise<string | null> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, SIGNED_URL_EXPIRES_IN_SECONDS);

    if (error || !data) {
      this.logger.error(
        `No se pudo generar signed URL para ${path}: ${error?.message}`,
      );
      return null;
    }

    return data.signedUrl;
  }
}
