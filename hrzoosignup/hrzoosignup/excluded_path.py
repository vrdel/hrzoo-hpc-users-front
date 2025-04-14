def custom_preprocessing_hook(endpoints):
   filtered = []
   for (path, path_regex, method, callback) in endpoints:
       if (
               not path.startswith("/api/v1/internal/") and
               not path.startswith("/auth") and
               not path.startswith("/api/v1/sessionactive") and
               not path.startswith("/api/v1/sshkeys")
       ):
           filtered.append((path, path_regex, method, callback))
   return filtered
