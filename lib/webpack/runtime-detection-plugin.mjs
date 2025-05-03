/**
 * Webpack plugin to help with runtime detection
 */
export class RuntimeDetectionPlugin {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap("RuntimeDetectionPlugin", (factory) => {
      factory.hooks.parser.for("javascript/auto").tap("RuntimeDetectionPlugin", (parser) => {
        // Add a global constant to indicate the build type
        parser.hooks.evaluateIdentifier.for("__PAGES_ROUTER__").tap("RuntimeDetectionPlugin", () => {
          // Check if we're building the Pages Router
          const isPagesRouter = compiler.options.entry["pages/_app"] !== undefined
          return {
            type: "Literal",
            value: isPagesRouter,
          }
        })
      })
    })
  }
}

export default RuntimeDetectionPlugin
