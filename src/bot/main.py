import os
import asyncio
from unbelipy import UnbeliClient

import discord
from discord.ext import commands

umb_client = UnbeliClient(token=os.environ['UNB_TOKEN'])
guild_id: int = int(os.environ['DISCORD_GUILD_ID'])
user_id: int = int(os.environ['DISCORD_USER_ID'])

bot = discord.Bot(intents=discord.Intents(messages=True, guilds=True))
# bot = commands.Bot()
# tree = discord.app_commands.CommandTree(bot)
# slash_client = SlashCommand(bot)

async def umb_test():
    print(f'guild_id: {guild_id}, user_id: {user_id}')
    
    perms = await umb_client.get_permissions(guild_id)
    print(f'perms: {perms}')
    
    guild = await umb_client.get_guild(guild_id)
    print(f'guild: {guild}')
    # guild_leaderboard = await umb_client.get_guild_leaderboard(guild_id)

    user_balance = await umb_client.get_user_balance(guild_id, user_id)
    print(f'user_balance: {user_balance}')
    user_balance = await umb_client.edit_user_balance(guild_id, user_id, cash=5)
    print(f'user_balance: {user_balance}')
    inventory = await umb_client.get_iventory_item(guild_id, user_id, { 'sort': ['item_id'], 'page': 1 })
    print(f'inventory: {inventory}')



asyncio.run(umb_test())

# class Fountain(commands.Cog):
#     def __init__(self, bot):
#         self.bot = bot

@bot.slash_command(guild_ids=[guild_id])
async def ping(ctx):
    print(f'ctx: {ctx}')
    await ctx.respond('Python!')

@bot.event
async def on_ready():
    print('bot ready.')

# tree.sync(guild=guild_id)

# bot.run(os.environ['DISCORD_TOKEN'])
