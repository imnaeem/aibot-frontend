import React, { useState } from "react";
import {
  Box,
  Button,
  Popover,
  Typography,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Badge,
  Divider,
  Tooltip,
  Fade,
  useTheme,
  alpha,
} from "@mui/material";
import {
  KeyboardArrowDown as ArrowDownIcon,
  Speed as SpeedIcon,
  AttachMoney as CostIcon,
  Star as StarIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import {
  AI_MODELS,
  DEFAULT_MODEL,
  SPEED_INDICATORS,
  COST_INDICATORS,
} from "../../utils/constants";

const ModelSelector = ({
  selectedModel = DEFAULT_MODEL,
  onModelChange,
  disabled = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentModel = AI_MODELS[selectedModel] || AI_MODELS[DEFAULT_MODEL];
  const models = Object.values(AI_MODELS);
  const popularModels = models.filter((model) => model.popular);

  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModelSelect = (modelId) => {
    if (onModelChange) {
      onModelChange(modelId);
    }
    handleClose();
  };

  const ModelCard = ({ model, isSelected }) => (
    <Card
      onClick={() => handleModelSelect(model.id)}
      sx={{
        cursor: "pointer",
        transition: "all 0.2s ease",
        border: `2px solid`,
        borderColor: isSelected ? model.color : "transparent",
        backgroundColor: isSelected
          ? alpha(model.color, 0.08)
          : "background.paper",
        position: "relative",
        "&:hover": {
          borderColor: model.color,
          backgroundColor: alpha(model.color, 0.04),
          transform: "translateY(-2px)",
          boxShadow: `0 8px 25px ${alpha(model.color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <Box
            sx={{
              fontSize: 24,
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: alpha(model.color, 0.1),
            }}
          >
            {model.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 0.5 }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.primary"
              >
                {model.name}
              </Typography>
              {model.isFree && (
                <Chip
                  label="FREE"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    backgroundColor: "success.100",
                    color: "success.800",
                    fontWeight: 600,
                  }}
                />
              )}
              {model.isLocal && (
                <Chip
                  label="Local"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    backgroundColor: "info.100",
                    color: "info.800",
                    fontWeight: 600,
                  }}
                />
              )}
              {model.popular && (
                <Chip
                  label="Popular"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    backgroundColor: "warning.100",
                    color: "warning.800",
                    fontWeight: 600,
                  }}
                />
              )}
              {isSelected && (
                <CheckIcon sx={{ fontSize: 16, color: model.color }} />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 1, display: "block" }}
            >
              {model.description}
            </Typography>

            <Stack direction="row" spacing={1}>
              <Tooltip title={`Speed: ${SPEED_INDICATORS[model.speed].label}`}>
                <Chip
                  size="small"
                  icon={<SpeedIcon sx={{ fontSize: 12 }} />}
                  label={model.speed}
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    backgroundColor: alpha(
                      SPEED_INDICATORS[model.speed].color,
                      0.1
                    ),
                    color: SPEED_INDICATORS[model.speed].color,
                    fontWeight: 500,
                    "& .MuiChip-icon": {
                      color: SPEED_INDICATORS[model.speed].color,
                    },
                  }}
                />
              </Tooltip>

              <Tooltip title={`Cost: ${COST_INDICATORS[model.cost].label}`}>
                <Chip
                  size="small"
                  icon={<CostIcon sx={{ fontSize: 12 }} />}
                  label={model.cost}
                  sx={{
                    height: 20,
                    fontSize: "0.65rem",
                    backgroundColor: alpha(
                      COST_INDICATORS[model.cost].color,
                      0.1
                    ),
                    color: COST_INDICATORS[model.cost].color,
                    fontWeight: 500,
                    "& .MuiChip-icon": {
                      color: COST_INDICATORS[model.cost].color,
                    },
                  }}
                />
              </Tooltip>
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ mt: 1, flexWrap: "wrap" }}
            >
              {model.capabilities.slice(0, 3).map((capability) => (
                <Chip
                  key={capability}
                  label={capability}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",
                    borderColor: alpha(model.color, 0.3),
                    color: model.color,
                    fontWeight: 500,
                  }}
                />
              ))}
              {model.capabilities.length > 3 && (
                <Chip
                  label={`+${model.capabilities.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 18,
                    fontSize: "0.6rem",
                    borderColor: alpha(theme.palette.text.secondary, 0.3),
                    color: "text.secondary",
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Tooltip title={disabled ? "Select a model" : "Change AI Model"}>
        <Button
          onClick={handleClick}
          disabled={disabled}
          variant="outlined"
          size="small"
          endIcon={<ArrowDownIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            height: 32,
            px: 1.5, // Normal horizontal padding
            backgroundColor: alpha(currentModel.color, 0.05),
            borderColor: alpha(currentModel.color, 0.3),
            color: currentModel.color,
            fontWeight: 500,
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
            "&:hover": {
              backgroundColor: alpha(currentModel.color, 0.1),
              borderColor: currentModel.color,
            },
            "&:disabled": {
              backgroundColor: "action.disabledBackground",
              borderColor: "action.disabled",
              color: "action.disabled",
            },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ fontSize: 12 }}>{currentModel.icon}</Box>
            <Typography
              variant="caption"
              fontWeight={500}
              sx={{ fontSize: "0.8rem" }}
            >
              {currentModel.name}
            </Typography>
          </Stack>
        </Button>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            border: "1px solid",
            borderColor: "divider",
            mt: 1,
            minWidth: 360,
            maxWidth: 400,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Choose AI Model
          </Typography>

          {/* Popular Models */}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <StarIcon sx={{ fontSize: 16, color: "warning.main" }} />
            Popular Models
          </Typography>

          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {popularModels.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                isSelected={selectedModel === model.id}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* All Models */}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ mb: 1.5 }}
          >
            All Models
          </Typography>

          <Stack spacing={1.5}>
            {models
              .filter((model) => !model.popular)
              .map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  isSelected={selectedModel === model.id}
                />
              ))}
          </Stack>

          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.success.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Typography
              variant="caption"
              color="success.dark"
              sx={{ fontWeight: 600 }}
            >
              🆓 <strong>All models are FREE!</strong> Local models run via
              Ollama, cloud models use free tiers.
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 1.5,
              p: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              💡 <strong>Tips:</strong> Llama for general chat, Code Llama for
              programming, Mistral for multilingual tasks
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default ModelSelector;
