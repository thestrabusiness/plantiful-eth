import * as fs from "fs";
import * as os from "os";

const ENV_PATH = "./frontend/.env";

const setEnvValue = (key: string, value: string) => {
  // read file from hdd & split if from a linebreak to a array
  const ENV_VARS = fs.readFileSync(ENV_PATH, "utf8").split(os.EOL);

  // find the env we want based on the key
  const match = ENV_VARS.find((line) => {
    return line.match(new RegExp(key));
  });

  if (match) {
    const target = ENV_VARS.indexOf(match);

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync(ENV_PATH, ENV_VARS.join(os.EOL));
  }
};

export default setEnvValue;

