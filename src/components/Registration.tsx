import * as React from 'react';
import { generateMnemonic } from 'bip39';
import { Box, Typography, Button, Paper } from '@material-ui/core';
import { generateKeyPair } from '../data/identity';

function generateMnemonics() {
  return [generateMnemonic(), generateMnemonic(), generateMnemonic()];
}

function RegistrationMnemonicStage({
  onConfirm,
}: {
  onConfirm: (mnemonic: string) => void;
}) {
  const [proposed, setProposed] = React.useState<string[]>(generateMnemonics());
  const [selected, setSelected] = React.useState<number | null>(null);

  const handleConfirm = React.useCallback(() => {
    if (!selected) return;

    onConfirm(proposed[selected]);
  }, [onConfirm, proposed, selected]);

  if (selected !== null) {
    return (
      <Box>
        <Typography paragraph color="primary" variant="h3">
          {proposed[selected]}
        </Typography>
        <Typography paragraph>
          You've chosen this recovery phrase for your account. You should now go
          ahead and write it down and keep it safe. If you use a password
          manager, you might add it in there.
        </Typography>
        <Typography paragraph>
          This is the last time we'll show you this phrase. Write it down
          somewhere safe before continuing.
        </Typography>
        <Button onClick={handleConfirm} variant="contained">
          I stored it
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography paragraph>
        Below are {proposed.length} different recovery phrases to choose from.
        If you lose your phone, you will need to use a recovery phrase in order
        to restore your account. Choose the one you connect with the most.
      </Typography>
      <Box>
        {proposed.map((phrase, index) => (
          <Box
            key={phrase}
            component={Paper}
            p={2}
            display="flex"
            flexDirection="row"
            mb={1}
          >
            <Typography style={{ flex: 1 }}>{phrase}</Typography>
            <Button onClick={() => setSelected(index)} variant="outlined">
              Choose
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export type RegistrationProps = {};

export function Registration({}: RegistrationProps) {
  const handleMnemonicSelected = React.useCallback(async (mnemonic: string) => {
    const keyPair = await generateKeyPair(mnemonic);
    const secondKeyPair = await generateKeyPair(mnemonic);
    console.debug(
      keyPair.privateKey.toString('utf-8') ===
        secondKeyPair.privateKey.toString('utf-8'),
    );
    console.debug(
      keyPair.publicKey.toString('utf-8') ===
        secondKeyPair.publicKey.toString('utf-8'),
    );
  }, []);

  return <RegistrationMnemonicStage onConfirm={handleMnemonicSelected} />;
}
