import { Global, Logger, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Prototype persistence: an ephemeral in-memory MongoDB.
 *
 * No external database or Docker is required — a real `mongod` is spun up in
 * memory on boot and torn down on shutdown. Data resets on every restart,
 * which is why the seeder re-creates demo accounts each start.
 *
 * To use a persistent database instead, set `MONGODB_URI` and
 * `NODE_ENV=production` in the environment.
 */
const logger = new Logger('DatabaseModule');

let memoryServer: MongoMemoryServer | null = null;

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const configuredUri = config.get<string>('database.uri');
        const isProd = config.get<string>('app.nodeEnv') === 'production';

        let uri = configuredUri;
        // Use the in-memory server unless explicitly running in production
        // against a real, configured database.
        if (!isProd) {
          memoryServer = await MongoMemoryServer.create();
          uri = memoryServer.getUri();
          logger.log('Started in-memory MongoDB for the prototype');
        }

        return {
          uri,
          connectionFactory: (connection: Connection) => {
            if (connection.readyState === 1) {
              logger.log('MongoDB connection established successfully');
            }
            connection.on('connected', () =>
              logger.log('MongoDB connection established successfully'),
            );
            connection.on('error', (error: Error) =>
              logger.error(`MongoDB connection error: ${error.message}`),
            );
            return connection;
          },
        };
      },
    }),
  ],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  }
}
