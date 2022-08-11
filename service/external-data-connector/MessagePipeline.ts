interface PipelineBuilder<TMessage, TResult> {
  (pipeline: MessageProcessingPipleing<TMessage, TResult>): void
}


export class MessageProcessingPipleing<TMessage, TResult> {
  private handlers : Array< (msg: TMessage, prev: TResult) => TResult> = []
  constructor(private intialise: (msg:TMessage) => TResult){
    
  }

  initialiseHandler(builder: PipelineBuilder<TMessage, TResult>): this{
    builder(this)
    return this
  }

  initialiseHandlers(builder: Array<PipelineBuilder<TMessage, TResult>> = []): this{
    builder.forEach(x => x(this))
    return this
  }

  withHandler(handle: (msg: TMessage, prev: TResult) => TResult) : this {
    this.handlers.push(handle)
    return this
  }

  handle(msg: TMessage) : TResult {
      const frozen = Object.freeze(msg)
      return this.handlers.reduce<TResult>(
        (prev, curr) => curr(frozen, prev),       
        this.intialise(msg)
      )
  }  
}