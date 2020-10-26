import { NotFoundException, Inject, Logger } from "@nestjs/common";
import { Args, Mutation, Query, Resolver, Subscription } from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { NotesService } from "./notes.service";

import { NoteType, FetchNoteType, PrivateNoteType } from "./gql/note.dto";
import { Filter, PageArgs } from "src/gql_common/types/common.input";

@Resolver()
export class NotesResolver {
  private readonly logger = new Logger(NotesResolver.name);

  constructor(
    private readonly notesService: NotesService,
    @Inject("PUB_SUB") private pubSub: PubSub, // @Inject("MQ_PUB") private mqPub: ClientProxy,
  ) {}

  @Subscription((returns) => NoteType, {
    filter: (payload, variables) => true,
  })
  noteUpdated(@Args("user_id") user_id: string) {
    if (user_id) this.logger.verbose(`${user_id}==>note subscribed`);
    return this.pubSub.asyncIterator("noteUpdated");
  }

  @Subscription((returns) => PrivateNoteType, {
    filter: (payload, variables) =>
      payload.privateNoteUpdated.receiver.includes(variables.user_id),
  })
  privateNoteUpdated(@Args("user_id") user_id: string) {
    if (user_id) this.logger.verbose(`${user_id}==>private note subscribed`);
    return this.pubSub.asyncIterator("privateNoteUpdated");
  }

  @Mutation((returns) => Boolean)
  async sendAuthEmail(
    @Args("user_id") user_id: string,
    @Args("email") email: string,
  ): Promise<boolean> {
    return await this.notesService.authMail(user_id, email);
  }

  /**
   * used for affiliate link
   * @param receivers
   * @param content
   */
  @Mutation((returns) => Boolean)
  async sendEmail(
    @Args({ name: "receivers", type: () => [String] })
    receivers: string[],

    @Args("content") content: string,
  ): Promise<boolean> {
    console.log("received affiliate link request:", receivers, content);
    return await this.notesService.sendEmail(receivers, content);
  }

  /////////////////////////////////////for notes//////////////////////////////

  @Mutation((returns) => Boolean)
  async removeNote(@Args("note_id") note_id: string): Promise<boolean> {
    console.log("remove note...", note_id);
    const req_res = await this.notesService.removeNote(note_id);

    return req_res;
  }

  @Query((returns) => FetchNoteType)
  async notes(
    @Args("pageArgs") pageArgs: PageArgs,
    @Args("filter") filter: Filter,
    @Args("user_id") user_id: string,
  ): Promise<FetchNoteType> {
    if (!user_id) {
      return null;
    }
    const res = await this.notesService.notes(pageArgs, filter, user_id);
    return res;
  }
}
