def custom_preprocessing_hook(endpoints):
   filtered = []
   for (path, path_regex, method, callback) in endpoints:
       if not (
           path.startswith("/api/v1/internal") or
           path.startswith("/api/v1/sessionactive") or
           path.startswith("/auth")
       ):
           filtered.append((path, path_regex, method, callback))
   return filtered
