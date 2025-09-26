require "json"
package = JSON.parse(File.read(File.join(__dir__, "package.json")))

is_new_arch_enabled  = ENV["RCT_NEW_ARCH_ENABLED"] == "1"
folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'

Pod::Spec.new do |s|
  s.name         = "react-native-iaphub"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]
  s.source       = { :git => "https://github.com/iaphub/react-native-iaphub.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.dependency "Iaphub", "4.6.5"

  # iOS deployment target: bump if new arch is on
  s.platforms = is_new_arch_enabled ? { ios: "13.4" } : { ios: "9.0" }

  if defined?(install_modules_dependencies)
    install_modules_dependencies(s)

    if is_new_arch_enabled && defined?(use_react_native_codegen!)
      use_react_native_codegen!(spec: s)
      s.compiler_flags = folly_compiler_flags
      s.pod_target_xcconfig = {
        "DEFINES_MODULE"          => "YES",
        "OTHER_CPLUSPLUSFLAGS"    => "-DRCT_NEW_ARCH_ENABLED=1",
        "HEADER_SEARCH_PATHS"     => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/Headers/Private/Yoga\"",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
    end
  else
    s.dependency "React-Core"

    if is_new_arch_enabled && defined?(use_react_native_codegen!)
      use_react_native_codegen!(spec: s)
      s.compiler_flags = "#{folly_compiler_flags} -DRCT_NEW_ARCH_ENABLED=1"
      s.pod_target_xcconfig = {
        "DEFINES_MODULE"          => "YES",
        "OTHER_CPLUSPLUSFLAGS"    => "-DRCT_NEW_ARCH_ENABLED=1",
        "HEADER_SEARCH_PATHS"     => "\"$(PODS_ROOT)/boost\" \"$(PODS_ROOT)/Headers/Private/Yoga\"",
        "CLANG_CXX_LANGUAGE_STANDARD" => "c++17"
      }
      # Only needed for apps without install_modules_dependencies helper
      s.dependency "React-Codegen"
      s.dependency "RCT-Folly"
      s.dependency "RCTRequired"
      s.dependency "RCTTypeSafety"
      s.dependency "ReactCommon/turbomodule/core"
    end
  end
end