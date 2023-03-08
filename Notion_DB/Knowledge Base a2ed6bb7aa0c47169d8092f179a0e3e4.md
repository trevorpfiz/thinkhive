# Knowledge Base

### ThinkHive Mission

Enable people to access and gain knowledge in a particular area of expertise by providing simple and straightforward access to information related to that domain.

Promote creativity and innovation through collaborative efforts.

- Implement innovative AI strategies
- Expertly craft AI solutions
- Intelligently automate manual processes
- Provide exceptional customer service

### Hero

Introducing the Ultimate AI-Powered Business Expert
Create intelligent chatbots that answer questions based on your organization's knowledge base, providing answers to your company-specific inquiries anytime, anywhere!

Our aim is to create intelligent chatbots that answer questions based on your organization's knowledge base. These documents can contain detailed information about every process involved in your business, enabling the chatbot to become an expert in your business operations. This chatbot can be accessed by users or team members at any time to get a better understanding of your business or its processes.

The goal is to create Discord bots that are capable of accurately answering questions specific to your company. For instance, an esports tournament league can upload their tournament ruleset, and competitors can ask the bot for clarification on any rule or to understand how the tournament will operate.

### Features

Everything you need to build your expert.

1. Upload your knowledge base
    1. Easily upload your documents and know that they are secure.
2. Train your own experts
    1. Customize your experts according to your knowledge base.
3. Deploy your custom-built expert
    1. Quickly make your expert accessible to your users and team members.
4. See them in action
    1. Your expert will provide intelligent answers to any questions asked by your users or team members.

### ThinkHive Dashboard

Our aim is to develop a chatbot that can provide intelligent answers to questions related to a set of uploaded documents. These documents can contain detailed information about every process involved in your business, enabling the chatbot to become an expert in your business operations. This chatbot can be accessed by users or team members at any time to get a better understanding of your business or its processes. My goal is to create a dashboard app that allows a user to create and manage their AI experts, upload PDFs to populate the brain of each expert one-by-one, manage the overall knowledge base as a whole, pick and choose the documents from the knowledge base to add to the brain or remove from the brain, track billing and usage, and export the experts out to Discord or other platforms.

- Sidebar to navigate the different features
    - AI Experts
    - Billing and usage
    - Tutorials
    - Help and FAQ
- AI Experts
    - View Knowledge base
        - Delete documents from knowledge base (also deletes from Experts’ brains)
    - Create an expert and name it
    - View all experts in a list
    - Access an Expert
    - Delete an Expert
- Expert
    - Rename Expert
    - Attach documents (PDF only) (multiple documents at once)
    - View word and token count (words is for user friendliness, tokens is the true usage metric)
    - Check if there is enough upload token usage to upload, and show the dynamic usage bar
    - If not, show error to user and offer them to buy more tokens or upgrade plan
    - If so, enable “Upload documents” button
    - Show status somewhere that details when upload is complete (when Pinecone is fully set up) and automatically make documents part of Expert’s brain
    - The Expert’s brain (documents it has knowledge of) is listed out using their metadata.
    - Manage individual documents that are part of the brain or the knowledge base.
        - Brain: the documents an Expert knows
        - Knowledge base: all the documents that have been uploaded
    - Delete individual documents and remove them from the knowledge base
    - Export the AI Expert to Discord
    - ? Dynamic retrieval from Pinecone (enables one database across all Experts and you can select the documents to be part of each Expert’s knowledge) ?
        - Here's how it can work:
        - Store embeddings for all 10 documents in your Pinecone database.
        - When a user creates a new expert and selects the 5 documents that they want to use, you can use Pinecone's filtering feature to create a new index that only includes embeddings for those 5 documents.
        - Associate the new index with the user's expert profile, so that when the chatbot receives a question from the user, it can use the new index to search for relevant information only within the 5 selected documents
- Billing and usage
    - Show current Plan name
    - View total token and message usage
        - Button for someone to purchase more tokens or messages
    - List out current plan features
    - View price, billing period, renewal date
    - Edit payment method, Update billing information, show invoice history
    - Append pricing page underneath to allow easy plan changing
- Tutorials
    - List out tutorial vids from YouTube
- Help and FAQ
    - Provide link to Discord community
    - List out FAQs

### ThinkHive FAQs

**What is an AI-Powered Business Expert?**

An AI-Powered Business Expert is a chatbot that has been trained to intelligently answer questions about a set of uploaded documents. This chatbot can become an expert on your business processes, allowing users or team members to talk to the chatbot anytime to better understand your business or its processes.

**What documents can be uploaded to the chatbot?**

Any documents that detail your business processes can be uploaded to the chatbot. This could include procedures, policies, and guidelines. We currently support uploading PDFs.

**What platforms does the chatbot support?**

The chatbot currently supports deployment as a Discord bot. Support for Slack, Microsoft Teams, and integration with website chat widgets are coming soon!

**How accurate are the chatbot's answers?**

The chatbot's answers are highly accurate as it has been trained to understand company-specific questions.

**What is the response time of the chatbot?**

Our chatbot utilizes the latest AI technology, ChatGPT, resulting in rapid responses in under one second.

**How can I train the chatbot?**

You can easily train the chatbot for your company by simply uploading your organization's specific documents.

**Can I use the chatbot for customer support?**

Yes, the chatbot can be used for customer support. Customers can ask the chatbot questions about your products or services, and the chatbot will provide accurate answers based on the uploaded documents.

**Can I customize the chatbot's responses?**

Yes, the chatbot's responses can be customized to fit your business's tone and voice. You can also update its knowledge as your business processes change and evolve.

**Does the chatbot support other languages?**

Yes, the chatbot has support for around 95 different languages and tries to respond in the same language as the user's question, regardless of the language of the documents.

**Where is my data stored?**

The complete documents are not stored, only their content is securely saved using Google Cloud servers. The content is restricted to be accessed only by users who engage with your expert.

**What industries can benefit from using the chatbot?**

The chatbot can be useful for any industry because there will always be team members or users who may not have complete knowledge or information about certain aspects of the business. The chatbot can provide such information easily and quickly.

If you can’t find what you’re looking for, talk to our expert in the ThinkHive Discord channel: [https://discord.gg/xYw9VScdzg](https://discord.gg/xYw9VScdzg)

### ThinkHive Pricing

The Trial Plan is completely free, so $0. You get fixed usage that doesn’t renew each month of 20 expert messages, 10,000 words uploaded to your expert, the ability to create one expert, and deploy your own Discord bot. The essentials to try out everything we offer.

The Hangout Plan is $20 per month. You get usage that is renewed each month of 1,000 expert messages, 50,000 words uploaded to your experts, the ability to create three experts, and deploy your own Discord bot. If you choose to pay annually, the Hangout Plan will cost $220. Ideal for small groups or individuals.

The Community Plan is $100 per month. You get usage that is renewed each month of 25,000 expert messages, 100,000 words uploaded to your experts, the ability to create five experts, and deploy your own Discord bot. If you choose to pay annually, the Community Plan will cost $1,100. Perfect for growing teams and communities.

The Enterprise Plan is $300 per month. You get usage that is renewed each month of 100,000 expert messages, 1,000,000 words uploaded to your experts, the ability to create ten experts, and deploy your own Discord bot. If you choose to pay annually, the Enterprise Plan will cost $3,300. Designed for large organizations and enterprises.

### Pricing FAQs

**What counts as one message?**

Each time a user asks a question to an expert and receives a response, it counts as one message.

**What is the Trial Plan?**

The Trial Plan is a no-cost plan that provides you with a complete end-to-end experience of using ThinkHive. This allows you to determine whether the platform is valuable to you before you decide to make any payment.

**Does the Trial Plan renew each month?**

No, it does not renew each month. The reason behind this is that we aim to provide our users with a generous and complete testing experience of ThinkHive, using all their data. If the fixed usage renewed every month, it would put a significant financial strain on us.

**What is the word count of the files that I wish to upload?**

Once you attach your files for upload, we will display the total word count of all the attached files.

**How can I determine if I need more usage?**

You can monitor your usage and billing information in the dashboard, which will display the amount of remaining usage and the next billing date. Once you reach your usage limit, you will not receive any further responses from your expert and uploading new information will not be possible.

**What is the difference between monthly billing and yearly billing?**

You have the option to subscribe and be billed either monthly or annually. If you choose to pay annually, you will be charged the full amount for the entire year upfront, but at a discounted price compared to paying on a monthly basis. You will receive one month free as part of the annual payment plan.

If you have any confusion whatsoever, contact us through our Discord channel: [https://discord.gg/xYw9VScdzg](https://discord.gg/xYw9VScdzg)

### ThinkHive Contact

ThinkHive website: [http://thinkhive.ai/](http://thinkhive.ai/)

ThinkHive Discord server: [https://discord.gg/xYw9VScdzg](https://discord.gg/xYw9VScdzg)

ThinkHive email: team@thinkhive.ai

### Discord Welcome

Hello and welcome to the official ThinkHive server! Please take a moment to read through this channel to familiarize yourself with the server.

#**announcements** - Stay up to date with the latest news.

#**general** - The place to discuss everything ThinkHive-related.

#**support** - Have a question for a ThinkHive expert? Here's the place to ask!

**Links:**

[http://www.thinkhive.ai/](http://www.thinkhive.ai/) - Check out our site to create your own expert!

### Discord Roles

**STAFF**

**@Admin**

- Administrator

**@Staff**

- ThinkHive Staff Members

**Earnable Roles**

**@Trial**

- Be an active Trial plan subscriber

**@Hangout**

- Be an active Hangout plan subscriber

**@Event**

- Be an active Event plan subscriber

**@Community**

- Be an active Community plan subscriber

### Discord Rules

**Rules!**

**1. Follow Discord's TOS**

> https://discordapp.com/terms
> 
> 
> [https://discordapp.com/guidelines](https://discordapp.com/guidelines)
> 

**2. Be respectful with all members**

> Be respectful to others , No death threats, sexism, hate speech, racism
No doxxing, swatting, witch hunting
> 

**3. No Advertising**

> Includes DM Advertising. We do not allow advertising here of any kind.
> 

**4. No NSFW content**

> Anything involving gore or sexual content is not allowed.
NSFW = Not Safe for Work
> 

**5. No spamming in text or VC**

> Do not spam messages, soundboards, voice changers, or loud sounds in any channel.
> 

**6. Do not discuss sensitive topics**

> This isn't a debating server, keep sensitive topics out of here so we can focus on helping each other.
> 

**7. No malicious content**

> No grabify links, viruses, crash videos, links to viruses, or token grabbers. These will result in an automated ban.
> 

**8. No Self Bots**

> Includes all kinds of selfbots: Nitro snipers, selfbots like nighty, auto changing statuses
> 

**9. Do not DM the staff team**

> Please go through #**support** or our official contact pipeline if you want to talk business.
> 

**10. Profile Picture / Banner Rules**

> No NSFW allowed
No racism
No flashing pictures to induce an epileptic attack
> 

**11. Emoji Rules**

> No NSFW allowed
No racism
No flashing pictures to induce an epileptic attack
> 

**12. Use English only**

> We cannot easily moderate chats in different languages, sorry. English only.
>