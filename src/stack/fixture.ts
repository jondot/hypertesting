import * as path from 'path'
import {
  Builder,
  fixturesIterator,
  Loader,
  Parser,
  Resolver
} from 'typeorm-fixtures-cli/dist'
import { getRepository } from 'typeorm'

const fixture = async (connection: any, file: string) => {
  const fixturePath = path.resolve(file)
  const loader = new Loader()

  loader.load(path.resolve(fixturePath))

  const resolver = new Resolver()
  const fixtures = resolver.resolve(loader.fixtureConfigs)
  const builder = new Builder(connection, new Parser())

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture)
    await getRepository(entity.constructor.name).delete({})
  }

  for (const fixture of fixturesIterator(fixtures)) {
    const entity = await builder.build(fixture)

    await getRepository(entity.constructor.name).save(entity)
  }
}

export default fixture
