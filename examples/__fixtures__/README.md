# Background

Gatsby is rather aggressive in finding queries so we can't link to the original
package. The installation operates fine, and it symlinks the folder above.
However, Gatsby aggressively searches through `node_modules`, and into the
symlink and back into the example directories. It ends up processing all of the
examples (and the one you are running a second time). This causes conflicts in
query name clashes.

So we make a "fake" version of the package that just reexports, and thereby do
not give gatsby any subfolders to search.
