# 💳 Guia Oficial de Instalação do Stripe (Monetização)
**Projeto: Pray for Day - Plano Fé (R$ 11,90 / mês)**

Este é o documento completo que te guiará passo a passo para conectar o seu código "Pray for Day" direto à sua conta bancária real utilizando o sistema oficial mundial de SaaS, o Stripe.

O desenvolvedor de código gerou tudo pronto no lado do servidor (Checkout, Interceptação de Webhooks e Banco de Dinheiro no Supabase), a única coisa que você, o C-Level, deve plugar agora, são as Chaves.

---

## 🏗️ PASSO 1: Criar a sua Máquina de Cobrança
1. Acesse o **[Stripe Dashboard](https://dashboard.stripe.com/)** e faça login na sua conta.
2. Com o seu painel aberto, sempre observe no topo direito se a chave escrita "Modo de Teste" (Test Mode) está ligada. Começaremos com testes, deixe ligado `(Modo de Testezinho)`.
3. Navegue no menu esquerdo para **Catálogo de Produtos** (Products).
4. Clique em **Adicionar Produto** (+ Add Product).
5. Preencha assim:
   - **Nome:** Pray for Day
   - **Descrição:** Acesso às ferramentas exclusivas, gravação de +3 orações longas, links do YouTube e Biblioteca de Favoritos.
   - **Preço (Preço padrão):** R$ 12,90 BRL.
   - **Modelo de Cobrança (Billing Period):** Mensal Recorrente (Recurring / Monthly).
6. Salve o produto. Na tela do Produto criado, vá na seção de preços e procure o **API ID** e copie-o. Ele de se parecer com `price_1X9z...`
7. Agora, abra o seu projeto no código `.env.local` e preencha essa chave em:
   ```env
   STRIPE_PRICE_ID=price_colar_teu_id_aqui
   ```

---

## 🔑 PASSO 2: As Chaves Secretas 
A aplicação precisa mandar os usuários para o pagamento com a sua identidade para depositar o dinheiro.

1. No Stripe Dashboard, busque por **Desenvolvedores** (Developers) no menu superior direito.
2. Acesse no menu à esquerda a tela de **Chaves de API** (API keys).
3. Você verá uma Tabela. Procure pela "Chave Secreta" `(Secret key)` que começa com `sk_test_...`
4. Revele a chave e copie na hora.
5. Volte pro seu arquivo `.env.local` e cole lá dentro:
   ```env
   STRIPE_SECRET_KEY=sk_test_colar_chave_secreta_aqui
   ```

---

## 🤖 PASSO 3: O Funcionário Virtual (Webhook)
Quando o usuário finalizar o pagamento lá no Stripe Checkout, quem vai voltar para o seu aplicativo (`Pray for Day`) e bater na porta do Supabase dizendo *"Liberar a estrela Premium do José!"*?
Essa responsabilidade é do nosso Webhook. O código para isso eu já escrevi em `/api/webhook/stripe/route.ts`. Precisamos apenas que o Stripe conheça esse endereço.

1. No Stripe Dashboard, dentro de Desenvolvedores, clique em **Webhooks**.
2. Clique no Botão "+ Novo Endpoint" (Add Endpoint).
3. No campo Endpoint URL, você deve colocar a internet onde o site respira:
   - *No desenvolvimento local não podemos testar sem um ngrok, mas para o deploy oficial será:* `https://seusite.com/api/webhook/stripe`.
4. Em Select Events (Escolher Eventos) ou "Eventos a escutar", adicione **Apenas ESSES DOIS**:
   - `checkout.session.completed` (Quando alguém paga e finaliza a compra com sucesso).
   - `customer.subscription.deleted` (Quando alguém cancelar o pacote do mês, bloqueando o acesso dele automaticamente).
5. Botão Enviar.
6. Na tela que vai abrir do Endpoint, clique em "Reveal" (Revelar) o segredo de assinatura ("Signing Secret"). Vai se parecer com `whsec_xX9...`.
7. Volte pro seu terminal, e cole essa chave no `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_colar_aqui
   ```

---

## 🚀 PASSO FINISH: Desativar Simulação
Eu construí uma simulação mágica pra ti no código que se passasse direto pra tela de pagamento sem você ter o `.env.local` configurado (focado no MVP TDD que encerramos). 
Para testar a real magia acontecendo no checkout lindo da API do Stripe após fazer esses 3 passos acima, simplesmente execute o comando a seguir:
`npm run dev` novamente e aperte em "ASSINAR 11,90". Ele sairá do bypass (onde eu alterava o banco automaticamente) e vai levar de verdade pra tela do seu Checkout.

**O Ouro do Micro-SaaS Fluiu!**
