'use client';

import { useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
// types
import type { IHypothesis } from 'src/types/physio-simulation';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  hypotheses: IHypothesis[];
  readOnly?: boolean;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onEdit: (id: string, text: string) => void;
};

export default function HypothesisListEditor({ hypotheses, readOnly, onAdd, onRemove, onEdit }: Props) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const handleAdd = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft('');
  };

  const handleStartEdit = (hypothesis: IHypothesis) => {
    setEditingId(hypothesis.id);
    setEditDraft(hypothesis.text);
  };

  const handleSaveEdit = () => {
    if (editingId && editDraft.trim()) onEdit(editingId, editDraft.trim());
    setEditingId(null);
  };

  return (
    <Box>
      {hypotheses.length === 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          No hypotheses recorded yet.
        </Typography>
      )}

      <Stack spacing={1} sx={{ mb: 2 }}>
        {hypotheses.map((hypothesis) => (
          <Stack
            key={hypothesis.id}
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              px: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: 'background.neutral',
            }}
          >
            {editingId === hypothesis.id ? (
              <>
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  value={editDraft}
                  onChange={(event) => setEditDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSaveEdit();
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                />
                <IconButton size="small" color="primary" onClick={handleSaveEdit}>
                  <Iconify icon="solar:check-circle-bold" width={20} />
                </IconButton>
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ flexGrow: 1 }}>
                  {hypothesis.text}
                </Typography>

                {!readOnly && (
                  <>
                    <IconButton size="small" onClick={() => handleStartEdit(hypothesis)}>
                      <Iconify icon="solar:pen-bold" width={18} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onRemove(hypothesis.id)}>
                      <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                    </IconButton>
                  </>
                )}
              </>
            )}
          </Stack>
        ))}
      </Stack>

      {!readOnly && (
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="e.g. Subacromial impingement"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAdd();
              }
            }}
          />
          <IconButton color="primary" disabled={!draft.trim()} onClick={handleAdd}>
            <Iconify icon="solar:add-circle-bold" width={24} />
          </IconButton>
        </Stack>
      )}
    </Box>
  );
}
