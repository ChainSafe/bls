{
  'targets': [
    {
      'target_name': 'blst_ts_addon',
      'sources': [
        'blst/src/server.c',
        'blst/build/assembly.S',
        'src/addon.cc',
        'src/secret_key.cc',
        'src/public_key.cc',
        'src/signature.cc',
        'src/functions.cc',
      ],
      'include_dirs': [
        'blst/bindings',
        "<!@(node -p \"require('node-addon-api').include_dir\")",
      ],
      'dependencies': [ "<!(node -p \"require('node-addon-api').gyp\")" ],
      'defines': [ 
        'NAPI_CPP_EXCEPTIONS'
      ],
      'cflags': [
          '-fexceptions',
          '-Werror',
          '-Wall',
          '-Wextra',
          '-Wpedantic',
      ],
      'cflags_cc': [
          '-std=c++17',
          '-fexceptions',
          '-Werror',
          '-Wall',
          '-Wextra',
          '-Wpedantic',
      ],
      'conditions': [
        [ 'OS=="win"', {
            'sources': [ 'blst/build/win64/*-x86_64.asm' ],
            'defines': [ '_HAS_EXCEPTIONS=1' ],
            'msvs_settings': {
              'VCCLCompilerTool': {
                'ExceptionHandling': 1,
                'EnablePREfast': 'true',
                'AdditionalOptions': [ '/std:c++17' ], 
              },
            },
          }
        ],
        [ 'OS=="linux"', {
            'ldflags': [ '-Wl,-Bsymbolic' ],
          }
        ],
        ['OS=="mac"', {
          'xcode_settings': {
            'OTHER_CFLAGS': ['-fvisibility=hidden'],
            'CLANG_CXX_LANGUAGE_STANDARD': 'c++17',
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
            'CLANG_CXX_LIBRARY': 'libc++',
            'MACOSX_DEPLOYMENT_TARGET': '12',
          }
        }]
      ],
    }
  ]
}