import { Card, CardContent, CardMedia, Typography, Chip, Stack } from '@mui/material';
export default function GameCard({ game }) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
      {game.background_image && (
        <CardMedia
          component="img"
          height="160"
          image={game.background_image}
          alt={game.name}
          loading="lazy"
        />
      )}
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span style={{ fontSize: 20, fontWeight: 600, textAlign: 'left' }}>{game.name}</span>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {game.genres?.slice(0, 3).map((g) => (
            <Chip key={g.id} label={g.name} size="small" />
          ))}
        </Stack>
        {game.released && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Data de lançamento:</span>{' '}
            <span style={{ fontWeight: 600 }}>{game.released}</span>
          </div>
        )}
        {typeof game.rating === 'number' && (
          <div style={{ display: 'flex', mt: 1, justifyContent: 'space-between' }}>
            <span>Avaliação:</span> <span style={{ fontWeight: 600 }}>{game.rating}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
