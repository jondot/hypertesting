"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dist_1 = require("typeorm-fixtures-cli/dist");
const typeorm_1 = require("typeorm");
const fixture = (connection, file) => __awaiter(this, void 0, void 0, function* () {
    const fixturePath = path.resolve(path.join(__dirname, file));
    const loader = new dist_1.Loader();
    loader.load(path.resolve(fixturePath));
    const resolver = new dist_1.Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new dist_1.Builder(connection, new dist_1.Parser());
    for (const fixture of dist_1.fixturesIterator(fixtures)) {
        const entity = yield builder.build(fixture);
        yield typeorm_1.getRepository(entity.constructor.name).delete({});
    }
    for (const fixture of dist_1.fixturesIterator(fixtures)) {
        const entity = yield builder.build(fixture);
        yield typeorm_1.getRepository(entity.constructor.name).save(entity);
    }
});
exports.default = fixture;
//# sourceMappingURL=fixture.js.map