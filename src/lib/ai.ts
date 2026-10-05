// Camada única de IA usada por todos os agentes da Top Max.
// Todos os provedores falam o formato OpenAI de chat completions, então trocar
// ou reordenar provedores é só configuração. Se um falhar (limite, créditos,
// instabilidade), o próximo assume automaticamente.

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Provider = {
  name: string;
  baseUrl: string;
  apiKey: string | undefined;
  model: string;
};

function getProviders(preferredOrder?: string[]): Provider[] {
  const providers: Provider[] = [
    {
      name: "nvidia",
      baseUrl: "https://integrate.api.nvidia.com/v1",
      apiKey: process.env.NVIDIA_API_KEY,
      model: process.env.NVIDIA_MODEL || "openai/gpt-oss-20b",
    },
    {
      name: "gemini",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    },
    {
      name: "groq",
      baseUrl: "https://api.groq.com/openai/v1",
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    },
  ];

  const order = preferredOrder ?? (process.env.AI_PROVIDER_ORDER || "nvidia,gemini,groq").split(",").map((name) => name.trim());

  return order
    .map((name) => providers.find((provider) => provider.name === name))
    .filter((provider): provider is Provider => Boolean(provider?.apiKey));
}

export function isAiConfigured() {
  return getProviders().length > 0;
}

export async function generateChatReply(
  messages: ChatMessage[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeoutMs?: number;
    reasoningEffort?: string;
    providerOrder?: string[];
    // Troca o modelo de um provedor só nesta chamada (ex.: Gerente usa um modelo maior).
    modelOverrides?: Partial<Record<string, string>>;
  } = {},
): Promise<{ text: string; provider: string }> {
  const providers = getProviders(options.providerOrder);

  if (providers.length === 0) {
    throw new Error("ai_not_configured");
  }

  const failures: string[] = [];
  const reasoningEffort = options.reasoningEffort ?? process.env.AI_REASONING_EFFORT ?? "low";

  for (const provider of providers) {
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: options.modelOverrides?.[provider.name] || provider.model,
          messages,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 1200,
          // Modelos com raciocínio (gpt-oss, Gemini) respondem bem mais rápido em "low".
          // AI_REASONING_EFFORT vazio desliga o parâmetro para modelos que não o aceitam.
          ...(reasoningEffort ? { reasoning_effort: reasoningEffort } : {}),
        }),
        signal: AbortSignal.timeout(options.timeoutMs ?? 25_000),
        cache: "no-store",
      });

      if (!response.ok) {
        failures.push(`${provider.name}: HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = String(data?.choices?.[0]?.message?.content ?? "").trim();

      if (!text) {
        failures.push(`${provider.name}: resposta vazia`);
        continue;
      }

      return { text, provider: provider.name };
    } catch (error) {
      failures.push(`${provider.name}: ${error instanceof Error ? error.message : "erro"}`);
    }
  }

  console.error("[ai] todos os provedores falharam:", failures.join(" | "));
  throw new Error(`ai_unavailable: ${failures.join(" | ")}`);
}
